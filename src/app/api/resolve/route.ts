// This route acts as a proxy, securely calling a third-party scraper API 
// defined by environment variables and normalizing the response for the frontend.

import { NextRequest, NextResponse } from "next/server";

// Environment variables are dynamically injected into the runtime environment.
// These variables control the API endpoint configuration.
const API_URL = process.env.INSTAGRAM_SCRAPER_API_URL;
const API_HOST = process.env.INSTAGRAM_SCRAPER_API_HOST;
const API_KEY = process.env.INSTAGRAM_SCRAPER_API_KEY;
const URL_PARAM = process.env.INSTAGRAM_SCRAPER_URL_PARAM || "url";
const METHOD = (process.env.INSTAGRAM_SCRAPER_METHOD || "GET").toUpperCase();
const POST_FORMAT = (process.env.INSTAGRAM_SCRAPER_POST_FORMAT || "json").toLowerCase();
const MOCK = process.env.INSTAGRAM_SCRAPER_MOCK === "true";
const DEBUG = process.env.INSTAGRAM_SCRAPER_DEBUG === "true";

// Define the shape of a single media item after normalization
interface NormalizedMedia {
  url: string;
  type: "image" | "video";
  thumbnail?: string;
}

// Utilities
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
  // handle: direct mp4/webm/mov, hls .m3u8, and reel-specific cdn paths
  if (/(\.mp4|\.m4v|\.mov|\.webm|\.m3u8)(\?.*)?$/.test(u)) return true;
  if (/reel|reels|hls|dash|video|mpd/.test(u)) return true;
  return false;
};

// Deep extraction that collects media candidates
const collectMedia = (node: any, out: NormalizedMedia[], seen: Set<string>) => {
  if (node == null) return;

  if (typeof node === "string") {
    const s = decodeHtmlEntities(node.trim());
    if (isHttp(s) && !seen.has(s) && !isThumbnailUrl(s)) {
      const type: NormalizedMedia["type"] = isVideo(s) ? "video" : isImage(s) ? "image" : "image";
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
    // Instagram-style structures: prefer explicit version arrays
    const vv = (node as any)?.video_versions;
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

    const iv2 = (node as any)?.image_versions2?.candidates;
    if (Array.isArray(iv2)) {
      for (const c of iv2) {
        const u = typeof c?.url === "string" ? c.url : undefined;
        if (u && !seen.has(u) && !isThumbnailUrl(u)) {
          const decoded = decodeHtmlEntities(u);
          const type: NormalizedMedia["type"] = isVideo(decoded) ? "video" : "image";
          out.push({ url: decoded, type });
          seen.add(decoded);
        }
      }
    }

    const directUrl = (node as any)?.url || (node as any)?.download_url || (node as any)?.media_url || (node as any)?.video_url || (node as any)?.image_url;
    if (typeof directUrl === "string" && !isThumbnailUrl(directUrl)) {
      const decoded = decodeHtmlEntities(directUrl);
      if (!seen.has(decoded)) {
        const type: NormalizedMedia["type"] = (node as any)?.video_url || isVideo(decoded) ? "video" : "image";
        const thumbnail = typeof (node as any)?.thumbnail === "string" ? (node as any).thumbnail : undefined;
        out.push({ url: decoded, type, thumbnail });
        seen.add(decoded);
      }
    }

    for (const v of Object.values(node)) collectMedia(v, out, seen);

    // Heuristic: any field name containing 'video' with a URL-like string is a video
    try {
      for (const [k, v] of Object.entries(node)) {
        if (typeof v === "string" && /video/i.test(k)) {
          const s = decodeHtmlEntities(v);
          if (isHttp(s) && !seen.has(s) && !isThumbnailUrl(s)) {
            out.push({ url: s, type: "video" });
            seen.add(s);
          }
        }
      }
    } catch {}
  }
};


export async function POST(req: NextRequest) {
  try {
    // Simple in-memory rate limit + cache (per instance)
    // Note: ephemeral in serverless; for production use a shared store (Upstash/Redis)
    // @ts-ignore
    globalThis.__ipHits ||= new Map<string, { count: number; ts: number }>();
    // @ts-ignore
    globalThis.__cache ||= new Map<string, { body: any; ts: number }>();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const key = `ip:${ip}`;
    const now = Date.now();
    const windowMs = 60_000; // 1 minute
    const maxReq = 30; // 30 requests/minute per IP
    const rec = (globalThis as any).__ipHits.get(key) || { count: 0, ts: now };
    const within = now - rec.ts < windowMs;
    const count = within ? rec.count + 1 : 1;
    (globalThis as any).__ipHits.set(key, { count, ts: within ? rec.ts : now });
    if (count > maxReq) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again shortly.' }, { status: 429 });
    }

    const body = await req.json();
    // Clean the URL by removing query parameters
    let url = typeof body?.url === "string" ? body.url.split("?")[0] : null;
    if (!url) return NextResponse.json({ error: "'url' is required" }, { status: 400 });

    // Cache by URL
    const cacheKey = `resolve:${url}`;
    const cached = (globalThis as any).__cache.get(cacheKey);
    if (cached && now - cached.ts < 5 * 60_000) {
      return NextResponse.json(cached.body, { status: 200 });
    }

    // --- MOCK MODE ---
    if (MOCK) {
      // If MOCK is true, return simulated data instantly for testing
      const media: NormalizedMedia[] = [];
      
      if (url.includes('video') || url.includes('reel')) {
         media.push({ url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", type: "video" });
      } else if (url.includes('carousel')) {
         media.push(
            { url: "https://placehold.co/1000x800/1e40af/ffffff?text=Image+1", type: "image" },
            { url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", type: "video" },
            { url: "https://placehold.co/1000x800/d97706/ffffff?text=Image+3", type: "image" },
         );
      } else {
         media.push({ url: "https://placehold.co/1000x800/10b981/ffffff?text=DOWNLOADABLE+IMAGE", type: "image" });
      }

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      return NextResponse.json({ media });
    }

    // --- LIVE API INTEGRATION ---
    if (!API_URL || !API_HOST || !API_KEY) {
      return NextResponse.json({ error: "Server API configuration is missing." }, { status: 500 });
    }

    const endpoint = new URL(API_URL);
    const fetchInit: RequestInit = {
      method: METHOD,
      headers: { "X-RapidAPI-Key": API_KEY!, "X-RapidAPI-Host": API_HOST! },
      signal: AbortSignal.timeout(20000), // Timeout after 20 seconds
    };

    // Configure request based on method (GET or POST)
    if (METHOD === "GET") {
      endpoint.searchParams.set(URL_PARAM, url);
    } else if (METHOD === "POST") {
      fetchInit.headers = {
        ...fetchInit.headers,
        "content-type": POST_FORMAT === "form" ? "application/x-www-form-urlencoded" : "application/json",
      };
      fetchInit.body = POST_FORMAT === "form" ? new URLSearchParams({ [URL_PARAM]: url }).toString() : JSON.stringify({ [URL_PARAM]: url });
    }

    // Make the external API call
    const resp = await fetch(endpoint.toString(), fetchInit);
    
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json({ error: `Resolver API error (${resp.status}): ${text}` }, { status: 502 });
    }

    const rawText = await resp.text();
    let data: any = null;
    try { data = rawText ? JSON.parse(rawText) : null; } catch {}

    // Normalize the data
    const candidates: NormalizedMedia[] = [];
    const seen = new Set<string>();
    collectMedia(data, candidates, seen);

    // If nothing collected, try parse any raw URLs from response body
    if (!candidates.length && typeof rawText === "string" && rawText) {
      const urlRegex = /https?:\/\/[^\s"'<>]+/g;
      const matches = rawText.match(urlRegex) || [];
      for (const s of matches) {
        const decoded = decodeHtmlEntities(s);
        if (!seen.has(decoded) && !isThumbnailUrl(decoded) && (isImage(decoded) || isVideo(decoded))) {
          candidates.push({ url: decoded, type: isVideo(decoded) ? "video" : "image" });
          seen.add(decoded);
        }
      }
    }

    // Prefer videos; if videos exist, drop images (often thumbnails)
    let hasVideo = candidates.some((m) => m.type === "video");
    let normalized = hasVideo ? candidates.filter((m) => m.type === "video") : candidates;

    // Reel-specific fallback: if input looks like a reel and no videos were found
    if (!hasVideo && /\/reel\//i.test(url)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const htmlResp = await fetch(url, {
          signal: controller.signal,
          headers: {
            // Try to look like a regular browser request
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
            "accept-language": "en-US,en;q=0.9",
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });
        clearTimeout(timeout);
        if (htmlResp.ok) {
          const html = await htmlResp.text();

          // 1) Try open graph video meta (several variants)
          let match =
            html.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
            html.match(/<meta[^>]+property=["']og:video:url["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
            html.match(/<meta[^>]+property=["']og:video:secure_url["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
            html.match(/<meta[^>]+itemprop=["']contentUrl["'][^>]+content=["']([^"']+)["'][^>]*>/i);
          if (match && match[1]) {
            const videoUrl = decodeHtmlEntities(match[1]);
            if (isHttp(videoUrl)) {
              normalized = [{ url: videoUrl, type: "video" }];
              hasVideo = true;
            }
          }

          // 2) Try to find video_url in embedded JSON
          if (!hasVideo) {
            match = html.match(/\"video_url\"\s*:\s*\"([^\"]+)\"/);
            if (match && match[1]) {
              const videoUrl = decodeHtmlEntities(match[1]);
              if (isHttp(videoUrl)) {
                normalized = [{ url: videoUrl, type: "video" }];
                hasVideo = true;
              }
            }
          }

          // 3) Generic scan: capture any https URL that looks like mp4/m3u8 and prefer the best
          if (!hasVideo) {
            const urls = new Set<string>();
            const re = /https?:\/\/[^\s"'<>]+\.(mp4|m3u8)(\?[^\s"'<>]*)?/gi;
            let m: RegExpExecArray | null;
            while ((m = re.exec(html)) !== null) {
              urls.add(decodeHtmlEntities(m[0]));
            }
            if (urls.size) {
              const scoreVideo = (u: string) => {
                const ul = u.toLowerCase();
                let s = 0;
                if (ul.includes("1080")) s += 5;
                if (ul.includes("1440") || ul.includes("2160")) s += 6;
                if (ul.includes("mp4")) s += 2;
                if (ul.includes("hls") || ul.includes("m3u8")) s += 1;
                s += Math.min(5, Math.floor(u.length / 120));
                return s;
              };
              const sorted = Array.from(urls).sort((a, b) => scoreVideo(b) - scoreVideo(a));
              normalized = sorted.map((u) => ({ url: u, type: "video" }));
              hasVideo = true;
            }
          }
        }

        // 4) Try JSON endpoint variants (?__a=1&__d=dis)
        if (!hasVideo) {
          const tryUrls = [
            url.replace(/\/?$/, "/") + "?__a=1&__d=dis",
            url.replace(/\/?$/, "/v/") + "?__a=1&__d=dis",
          ];
          for (const ju of tryUrls) {
            try {
              const jr = await fetch(ju, {
                headers: {
                  "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
                  accept: "application/json,text/*;q=0.8",
                },
              });
              if (jr.ok) {
                const jt = await jr.text();
                let j: any = null;
                try { j = jt ? JSON.parse(jt) : null; } catch {}
                if (j) {
                  const urls: string[] = [];
                  const walk = (n: any) => {
                    if (!n) return;
                    if (typeof n === 'object') {
                      if (typeof n.video_url === 'string') urls.push(n.video_url);
                      if (Array.isArray(n.video_versions)) {
                        for (const v of n.video_versions) if (typeof v?.url === 'string') urls.push(v.url);
                      }
                      for (const v of Object.values(n)) walk(v);
                    }
                  };
                  walk(j);
                  const uniq = Array.from(new Set(urls)).filter((u) => isHttp(u));
                  if (uniq.length) {
                    normalized = uniq.map((u) => ({ url: decodeHtmlEntities(u), type: 'video' }));
                    hasVideo = true;
                    break;
                  }
                }
              }
            } catch {}
          }
        }
      } catch {}
    }

    // If we have multiple video versions, pick the highest quality first but keep all to allow user choice
    if (hasVideo && normalized.length > 1) {
      const scoreVideo = (u: string) => {
        const ul = u.toLowerCase();
        let s = 0;
        if (ul.includes("1080")) s += 5;
        if (ul.includes("1440") || ul.includes("2160")) s += 6;
        if (ul.includes("h264") || ul.includes("mp4")) s += 2;
        if (ul.includes("dash")) s += 1; // often segmented MP4
        if (ul.includes("m3u8")) s += 1; // HLS
        s += Math.min(5, Math.floor(u.length / 120));
        return s;
      };
      normalized = [...normalized].sort((a, b) => scoreVideo(b.url) - scoreVideo(a.url));
    }

    // For images: dedupe and prefer higher-quality heuristics
    if (!hasVideo && normalized.length > 1) {
      // Group by parent path (without filename). IG CDN often serves multiple variants under same folder
      const imageMap = new Map<string, NormalizedMedia>();
      for (const media of normalized) {
        const baseUrl = media.url.split("?")[0];
        const pathParts = baseUrl.split("/");
        const fileName = pathParts.filter(Boolean).pop() || baseUrl;
        const basePath = pathParts.slice(0, -1).join("/") || baseUrl; // parent path as key
        const existing = imageMap.get(basePath);
        if (!existing) {
          imageMap.set(basePath, media);
    } else {
          // Prefer URLs with quality indicators or longer urls
          const score = (u: string) => {
            let s = 0;
            if (u.includes("1440")) s += 4;
            if (u.includes("1080")) s += 3;
            if (u.includes("original")) s += 3;
            if (u.includes("full")) s += 2;
            if (!isThumbnailUrl(u)) s += 1;
            s += Math.min(5, Math.floor(u.length / 100));
            return s;
          };
          const better = score(media.url) >= score(existing.url);
          if (better) imageMap.set(basePath, media);
        }
      }
      normalized = Array.from(imageMap.values());
      if (!normalized.length && candidates.length) normalized = [candidates[0]];
    }


    // If input is a reel, require video; do not fall back to images/thumbnails
    if (/\/reel\//i.test(url)) {
      const reelVideos = normalized.filter((m) => m.type === "video");
      if (!reelVideos.length) {
        return NextResponse.json(
          { error: "Could not resolve reel video for this URL. Try again or use a different reel." },
          { status: 404 }
        );
      }
      normalized = reelVideos;
    }

    if (normalized.length === 0) return NextResponse.json({ error: "Could not resolve media links. Check post visibility." }, { status: 404 });

    // Success response: returns the array of normalized media items
    const responseBody = { media: normalized };
    (globalThis as any).__cache.set(cacheKey, { body: responseBody, ts: now });
    return NextResponse.json(responseBody);
  } catch (err: unknown) {
    if (DEBUG) console.error("Full API Route Error:", err);
    const msg = err instanceof Error ? err.message : "An unexpected server error occurred.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
