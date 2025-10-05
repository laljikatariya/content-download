// This route acts as a proxy, securely calling a third-party scraper API 
// defined by environment variables and normalizing the response for the frontend.

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.INSTAGRAM_SCRAPER_API_URL;
const API_HOST = process.env.INSTAGRAM_SCRAPER_API_HOST;
const API_KEY = process.env.INSTAGRAM_SCRAPER_API_KEY;
const URL_PARAM = process.env.INSTAGRAM_SCRAPER_URL_PARAM || "url";
const METHOD = (process.env.INSTAGRAM_SCRAPER_METHOD || "GET").toUpperCase();
const POST_FORMAT = (process.env.INSTAGRAM_SCRAPER_POST_FORMAT || "json").toLowerCase();
const MOCK = process.env.INSTAGRAM_SCRAPER_MOCK === "true";
const DEBUG = process.env.INSTAGRAM_SCRAPER_DEBUG === "true";

interface NormalizedMedia {
  url: string;
  type: "image" | "video";
  thumbnail?: string;
}

interface CacheEntry {
  body: Record<string, unknown>;
  ts: number;
}

interface IpHit {
  count: number;
  ts: number;
}

// Use globalThis safely with defined types
declare global {
  // eslint-disable-next-line no-var
  var __ipHits: Map<string, IpHit> | undefined;
  // eslint-disable-next-line no-var
  var __cache: Map<string, CacheEntry> | undefined;
}

const decodeHtmlEntities = (u: string): string =>
  u
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const isThumbnailUrl = (u: string): boolean => {
  const lower = u.toLowerCase();
  return (
    lower.includes("thumbnail") ||
    lower.includes("thumb") ||
    lower.includes("/t/") ||
    lower.includes("_t.") ||
    lower.includes("150x150") ||
    lower.includes("320x320") ||
    lower.includes("480x480") ||
    lower.includes("640x640") ||
    lower.includes("/s/") ||
    lower.includes("_s.") ||
    lower.includes("_small") ||
    lower.includes("_low") ||
    lower.includes("_preview") ||
    /\/\d{3}x\d{3}\//.test(lower)
  );
};

const isHttp = (s: string) => /^https?:\/\//i.test(s);
const isImage = (s: string) => {
  const u = s.toLowerCase();
  return /(\.jpg|\.jpeg|\.png|\.webp|\.gif)(\?.*)?$/.test(u) || u.includes("image/");
};
const isVideo = (s: string) => {
  const u = s.toLowerCase();
  if (/(\.mp4|\.m4v|\.mov|\.webm|\.m3u8)(\?.*)?$/.test(u)) return true;
  if (/reel|reels|hls|dash|video|mpd/.test(u)) return true;
  return false;
};

const collectMedia = (
  node: unknown,
  out: NormalizedMedia[],
  seen: Set<string>
): void => {
  if (node == null) return;

  if (typeof node === "string") {
    const s = decodeHtmlEntities(node.trim());
    if (isHttp(s) && !seen.has(s) && !isThumbnailUrl(s)) {
      const type: NormalizedMedia["type"] = isVideo(s)
        ? "video"
        : isImage(s)
        ? "image"
        : "image";
      out.push({ url: s, type });
      seen.add(s);
    }
    return;
  }

  if (Array.isArray(node)) {
    for (const it of node) collectMedia(it, out, seen);
    return;
  }

  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const vv = obj.video_versions as Array<{ url?: string }> | undefined;
    if (Array.isArray(vv)) {
      for (const v of vv) {
        const u = typeof v?.url === "string" ? v.url : undefined;
        if (u && !seen.has(u) && !isThumbnailUrl(u)) {
          const decoded = decodeHtmlEntities(u);
          out.push({ url: decoded, type: "video" });
          seen.add(decoded);
        }
      }
    }

    const iv2 = (obj.image_versions2 as { candidates?: Array<{ url?: string }> })?.candidates;
    if (Array.isArray(iv2)) {
      for (const c of iv2) {
        const u = typeof c?.url === "string" ? c.url : undefined;
        if (u && !seen.has(u) && !isThumbnailUrl(u)) {
          const decoded = decodeHtmlEntities(u);
          const type: NormalizedMedia["type"] = isVideo(decoded)
            ? "video"
            : "image";
          out.push({ url: decoded, type });
          seen.add(decoded);
        }
      }
    }

    const directUrl =
      (obj.url as string) ||
      (obj.download_url as string) ||
      (obj.media_url as string) ||
      (obj.video_url as string) ||
      (obj.image_url as string);

    if (typeof directUrl === "string" && !isThumbnailUrl(directUrl)) {
      const decoded = decodeHtmlEntities(directUrl);
      if (!seen.has(decoded)) {
        const type: NormalizedMedia["type"] =
          obj.video_url || isVideo(decoded) ? "video" : "image";
        const thumbnail =
          typeof obj.thumbnail === "string" ? obj.thumbnail : undefined;
        out.push({ url: decoded, type, thumbnail });
        seen.add(decoded);
      }
    }

    for (const v of Object.values(obj)) collectMedia(v, out, seen);

    try {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" && /video/i.test(k)) {
          const s = decodeHtmlEntities(v);
          if (isHttp(s) && !seen.has(s) && !isThumbnailUrl(s)) {
            out.push({ url: s, type: "video" });
            seen.add(s);
          }
        }
      }
    } catch {
      // ignore
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    globalThis.__ipHits ||= new Map<string, IpHit>();
    globalThis.__cache ||= new Map<string, CacheEntry>();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `ip:${ip}`;
    const now = Date.now();
    const windowMs = 60_000;
    const maxReq = 30;
    const rec = globalThis.__ipHits.get(key) || { count: 0, ts: now };
    const within = now - rec.ts < windowMs;
    const count = within ? rec.count + 1 : 1;
    globalThis.__ipHits.set(key, { count, ts: within ? rec.ts : now });
    if (count > maxReq) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as { url?: string };
    const url = typeof body?.url === "string" ? body.url.split("?")[0] : null;
    if (!url)
      return NextResponse.json({ error: "'url' is required" }, { status: 400 });

    const cacheKey = `resolve:${url}`;
    const cached = globalThis.__cache.get(cacheKey);
    if (cached && now - cached.ts < 5 * 60_000) {
      return NextResponse.json(cached.body, { status: 200 });
    }

    if (MOCK) {
      const media: NormalizedMedia[] = [];

      if (url.includes("video") || url.includes("reel")) {
        media.push({
          url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          type: "video",
        });
      } else if (url.includes("carousel")) {
        media.push(
          {
            url: "https://placehold.co/1000x800/1e40af/ffffff?text=Image+1",
            type: "image",
          },
          {
            url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            type: "video",
          },
          {
            url: "https://placehold.co/1000x800/d97706/ffffff?text=Image+3",
            type: "image",
          }
        );
      } else {
        media.push({
          url: "https://placehold.co/1000x800/10b981/ffffff?text=DOWNLOADABLE+IMAGE",
          type: "image",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json({ media });
    }

    if (!API_URL || !API_HOST || !API_KEY) {
      return NextResponse.json(
        { error: "Server API configuration is missing." },
        { status: 500 }
      );
    }

    const endpoint = new URL(API_URL);
    const fetchInit: RequestInit = {
      method: METHOD,
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST,
      },
      signal: AbortSignal.timeout(20000),
    };

    if (METHOD === "GET") {
      endpoint.searchParams.set(URL_PARAM, url);
    } else if (METHOD === "POST") {
      fetchInit.headers = {
        ...fetchInit.headers,
        "content-type":
          POST_FORMAT === "form"
            ? "application/x-www-form-urlencoded"
            : "application/json",
      };
      fetchInit.body =
        POST_FORMAT === "form"
          ? new URLSearchParams({ [URL_PARAM]: url }).toString()
          : JSON.stringify({ [URL_PARAM]: url });
    }

    const resp = await fetch(endpoint.toString(), fetchInit);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: `Resolver API error (${resp.status}): ${text}` },
        { status: 502 }
      );
    }

    const rawText = await resp.text();
    let data: unknown = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      // ignore
    }

    const candidates: NormalizedMedia[] = [];
    const seen = new Set<string>();
    collectMedia(data, candidates, seen);

    if (!candidates.length && typeof rawText === "string" && rawText) {
      const urlRegex = /https?:\/\/[^\s"'<>]+/g;
      const matches = rawText.match(urlRegex) || [];
      for (const s of matches) {
        const decoded = decodeHtmlEntities(s);
        if (
          !seen.has(decoded) &&
          !isThumbnailUrl(decoded) &&
          (isImage(decoded) || isVideo(decoded))
        ) {
          candidates.push({
            url: decoded,
            type: isVideo(decoded) ? "video" : "image",
          });
          seen.add(decoded);
        }
      }
    }

    const hasVideo = candidates.some((m) => m.type === "video");
    const normalized = hasVideo
      ? candidates.filter((m) => m.type === "video")
      : candidates;

    const responseBody = { media: normalized };
    globalThis.__cache.set(cacheKey, { body: responseBody, ts: now });
    return NextResponse.json(responseBody);
  } catch (err: unknown) {
    if (DEBUG) console.error("Full API Route Error:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "An unexpected server error occurred.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
