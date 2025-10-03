import { NextRequest, NextResponse } from "next/server";

// This endpoint resolves an Instagram post URL to direct media links via a third-party API.
// Configure via environment variables:
// - INSTAGRAM_SCRAPER_API_URL (e.g., https://instagram-downloader-download-post.p.rapidapi.com/)
// - INSTAGRAM_SCRAPER_API_HOST (e.g., instagram-downloader-download-post.p.rapidapi.com)
// - INSTAGRAM_SCRAPER_API_KEY  (RapidAPI key)
// - INSTAGRAM_SCRAPER_URL_PARAM (optional, defaults to "url"; some providers require a different name like "post_url")
// - INSTAGRAM_SCRAPER_METHOD (optional: GET | POST, defaults to GET)
// - INSTAGRAM_SCRAPER_POST_FORMAT (optional: json | form, defaults to json; only used when METHOD=POST)
// - INSTAGRAM_SCRAPER_MOCK (optional: when "true", skips external API and returns sample data)
// NOTE: Downloading content you do not own may violate Instagram's Terms. Use responsibly.

const API_URL = process.env.INSTAGRAM_SCRAPER_API_URL;
const API_HOST = process.env.INSTAGRAM_SCRAPER_API_HOST;
const API_KEY = process.env.INSTAGRAM_SCRAPER_API_KEY;
const URL_PARAM = process.env.INSTAGRAM_SCRAPER_URL_PARAM || "url";
const METHOD = (process.env.INSTAGRAM_SCRAPER_METHOD || "GET").toUpperCase();
const POST_FORMAT = (process.env.INSTAGRAM_SCRAPER_POST_FORMAT || "json").toLowerCase();
const MOCK = process.env.INSTAGRAM_SCRAPER_MOCK === "true";
const DEBUG = process.env.INSTAGRAM_SCRAPER_DEBUG === "true";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { error: "Invalid request. 'url' is required." },
        { status: 400 }
      );
    }

    // Mock mode: return sample media without calling any external API
    if (MOCK) {
      const sample = [
        {
          url: "https://example.com/sample-image.jpg",
          type: "image",
          thumbnail: "https://picsum.photos/seed/insta1/640/360",
        },
        {
          url: "https://example.com/sample-video.mp4",
          type: "video",
          thumbnail: "https://picsum.photos/seed/insta2/640/360",
        },
      ];
      return NextResponse.json({ media: sample });
    }

    if (!API_URL || !API_HOST || !API_KEY) {
      return NextResponse.json(
        {
          error:
            "Server is not configured. Set INSTAGRAM_SCRAPER_API_URL, INSTAGRAM_SCRAPER_API_HOST, and INSTAGRAM_SCRAPER_API_KEY in your environment.",
        },
        { status: 500 }
      );
    }

    // Build request based on configured METHOD and parameter location/format
    const endpoint = new URL(API_URL);
    let fetchUrl = endpoint.toString();
    let fetchInit: RequestInit = {
      method: METHOD,
      headers: {
        "X-RapidAPI-Key": API_KEY!,
        "X-RapidAPI-Host": API_HOST!,
      },
      signal: AbortSignal.timeout(20000), // 20s timeout via AbortController
    };

    if (METHOD === "GET") {
      // Place the Instagram URL as a query param
      endpoint.searchParams.set(URL_PARAM, url);
      fetchUrl = endpoint.toString();
    } else if (METHOD === "POST") {
      if (POST_FORMAT === "form") {
        // application/x-www-form-urlencoded
        const body = new URLSearchParams({ [URL_PARAM]: url }).toString();
        fetchInit.headers = {
          ...fetchInit.headers,
          "content-type": "application/x-www-form-urlencoded",
        } as Record<string, string>;
        fetchInit.body = body;
      } else {
        // default json
        fetchInit.headers = {
          ...fetchInit.headers,
          "content-type": "application/json",
        } as Record<string, string>;
        fetchInit.body = JSON.stringify({ [URL_PARAM]: url });
      }
    }

    // Lightweight debug (no key exposed)
    try {
      const maskedKey = API_KEY ? `${API_KEY.slice(0, 4)}…${API_KEY.slice(-2)}` : "<none>";
      console.debug("[resolve] calling", {
        url: endpoint.toString(),
        method: METHOD,
        host: API_HOST,
        urlParam: URL_PARAM,
        postFormat: METHOD === "POST" ? POST_FORMAT : undefined,
        key: maskedKey,
      });
    } catch {}

    const resp = await fetch(fetchUrl, fetchInit);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json(
        {
          error: `Resolver error (${resp.status}): ${text || resp.statusText}`,
          hint:
            "Verify INSTAGRAM_SCRAPER_API_URL path, INSTAGRAM_SCRAPER_API_HOST, METHOD/POST_FORMAT, and URL_PARAM match your RapidAPI endpoint.",
          requested: {
            url: fetchUrl,
            method: METHOD,
            host: API_HOST,
            urlParam: URL_PARAM,
            postFormat: METHOD === "POST" ? POST_FORMAT : undefined,
          },
        },
        { status: 502 }
      );
    }

    // Read response as text first, then attempt JSON parse. This allows us to provide better debug info
    // and fallback heuristics even when the provider returns non-JSON or slightly malformed JSON.
    const rawText = await resp.text();
    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    // Normalize common shapes from popular RapidAPI endpoints
    // We attempt to extract media list with url/type/thumbnail
    const normalized: Array<{ url: string; type: string; thumbnail?: string }> = [];

    // Helper to decode HTML entities in URLs (e.g., &amp; -> &)
    const decodeHtmlEntities = (url: string): string => {
      return url
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    };

    // Helper to check if a URL is likely a thumbnail (lower quality, smaller dimensions)
    const isThumbnailUrl = (url: string): boolean => {
      const lower = url.toLowerCase();
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
        /\/\d{3}x\d{3}\//.test(lower) // matches /300x300/ or similar small dimensions
      );
    };

    // Known shapes handling
    if (Array.isArray(data?.media) && data.media.length) {
      for (const m of data.media) {
        // Only add if url exists and is not a thumbnail URL
        if (m?.url && !isThumbnailUrl(m.url)) {
          normalized.push({ url: decodeHtmlEntities(m.url), type: m.type || "media", thumbnail: m.thumbnail });
        }
      }
    } else if (Array.isArray(data) && data.length && data[0]?.url) {
      for (const m of data) {
        if (m?.url && !isThumbnailUrl(m.url)) {
          normalized.push({ url: decodeHtmlEntities(m.url), type: m.type || "media", thumbnail: m.thumbnail });
        }
      }
    } else if (data?.links && Array.isArray(data.links)) {
      for (const u of data.links) {
        if (typeof u === "string" && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: "media" });
        }
      }
    } else if (typeof data?.download_url === "string" && !isThumbnailUrl(data.download_url)) {
      normalized.push({ url: decodeHtmlEntities(data.download_url), type: "media" });
    } else if (typeof data?.media_url === "string" && !isThumbnailUrl(data.media_url)) {
      normalized.push({ url: decodeHtmlEntities(data.media_url), type: "media" });
    } else if (typeof data?.video_url === "string" && !isThumbnailUrl(data.video_url)) {
      normalized.push({ url: decodeHtmlEntities(data.video_url), type: "video" });
    } else if (typeof data?.image_url === "string" && !isThumbnailUrl(data.image_url)) {
      normalized.push({ url: decodeHtmlEntities(data.image_url), type: "image" });
    } else if (data?.result && Array.isArray(data.result)) {
      for (const m of data.result) {
        const u = m?.url || m?.download_url || m?.media_url;
        if (typeof u === "string" && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: m?.type || "media", thumbnail: m?.thumbnail });
        }
      }
    } else if (data?.items && Array.isArray(data.items)) {
      for (const it of data.items) {
        const u = it?.url || it?.display_url || it?.video_url || it?.image_url;
        if (typeof u === "string" && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: it?.video_url ? "video" : it?.image_url ? "image" : (it?.type || "media"), thumbnail: it?.thumbnail || it?.display_url });
        }
      }
    } else if (Array.isArray(data?.images)) {
      for (const u of data.images) {
        if (typeof u === "string" && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: "image" });
        }
      }
    } else if (Array.isArray(data?.videos)) {
      for (const u of data.videos) {
        if (typeof u === "string" && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: "video" });
        }
      }
    }

    // Fallback: recursively scan the JSON (or raw text) for direct media URLs when shape is unknown
    if (!normalized.length) {
      const isHttp = (s: string) => /^https?:\/\//i.test(s);
      const isImage = (s: string) => /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(s);
      const isVideo = (s: string) => /\.(mp4|m4v|mov|webm|m3u8)(\?.*)?$/i.test(s);
      const seen = new Set<string>();
      const candidates: Array<{ url: string; type: string }> = [];

      const walk = (node: any, depth = 0) => {
        if (depth > 6) return; // avoid overly deep structures
        if (node == null) return;
        if (typeof node === "string") {
          const s = decodeHtmlEntities(node.trim());
          if (isHttp(s) && !seen.has(s) && !isThumbnailUrl(s)) {
            if (isVideo(s)) {
              candidates.push({ url: s, type: "video" });
              seen.add(s);
            } else if (isImage(s)) {
              candidates.push({ url: s, type: "image" });
              seen.add(s);
            }
          }
          return;
        }
        if (Array.isArray(node)) {
          for (const it of node) walk(it, depth + 1);
          return;
        }
        if (typeof node === "object") {
          for (const key of Object.keys(node)) walk((node as any)[key], depth + 1);
        }
      };

      try { if (data) walk(data); } catch {}

      // As a last resort, scan raw text for common media URL patterns
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

      for (const c of candidates.slice(0, 20)) {
        normalized.push({ url: c.url, type: c.type });
      }
    }

    // If we have videos, remove any images (which are likely thumbnails for the video)
    const hasVideo = normalized.some((m) => m.type === "video");
    let finalMedia = hasVideo 
      ? normalized.filter((m) => m.type === "video")
      : normalized;

    // For images: remove duplicates and prefer higher quality versions
    // Keep only unique images by comparing URLs (remove query params for comparison)
    if (!hasVideo && finalMedia.length > 1) {
      const imageMap = new Map<string, typeof finalMedia[0]>();
      
      for (const media of finalMedia) {
        // Extract base URL without query params for comparison
        const baseUrl = media.url.split('?')[0];
        // Also check the path without the last segment (filename) to catch similar URLs
        const pathParts = baseUrl.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const basePath = pathParts.slice(0, -1).join('/');
        
        // Use filename as key to group similar images
        const existing = imageMap.get(fileName);
        
        if (!existing) {
          imageMap.set(fileName, media);
        } else {
          // Prefer URLs with quality indicators or longer URLs (usually higher quality)
          const isHigherQuality = 
            media.url.length > existing.url.length ||
            media.url.includes('1080') ||
            media.url.includes('1440') ||
            media.url.includes('original') ||
            media.url.includes('full') ||
            !isThumbnailUrl(media.url); // Prefer non-thumbnail URLs
          
          if (isHigherQuality) {
            imageMap.set(fileName, media);
          }
        }
      }
      
      finalMedia = Array.from(imageMap.values());
      
      // If we filtered everything out, keep at least the first one
      if (finalMedia.length === 0 && normalized.length > 0) {
        finalMedia = [normalized[0]];
      }
    }

    if (!finalMedia.length) {
      // Provide limited debug info to aid configuration when enabled
      if (DEBUG) {
        let debugKeys: string[] | undefined = undefined;
        try {
          if (data && typeof data === "object") {
            debugKeys = Object.keys(data).slice(0, 20);
          }
        } catch {}
        const rawSnippet = typeof rawText === "string" ? rawText.slice(0, 1000) : undefined;
        return NextResponse.json(
          {
            error: "Could not resolve media links for this URL.",
            debug: {
              keys: debugKeys,
              rawSnippet,
              requested: {
                url: fetchUrl,
                method: METHOD,
                host: API_HOST,
                urlParam: URL_PARAM,
                postFormat: METHOD === "POST" ? POST_FORMAT : undefined,
              },
            },
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Could not resolve media links for this URL." },
        { status: 404 }
      );
    }

    return NextResponse.json({ media: finalMedia });
  } catch (err: any) {
    const msg = err?.message || "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
