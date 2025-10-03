import { NextRequest, NextResponse } from "next/server";

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
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url : null;
    if (!url) {
      return NextResponse.json({ error: "Invalid request. 'url' is required." }, { status: 400 });
    }

    if (MOCK) {
      const sample = [
        { url: "https://example.com/sample-image.jpg", type: "image", thumbnail: "https://picsum.photos/seed/insta1/640/360" },
        { url: "https://example.com/sample-video.mp4", type: "video", thumbnail: "https://picsum.photos/seed/insta2/640/360" },
      ];
      return NextResponse.json({ media: sample });
    }

    if (!API_URL || !API_HOST || !API_KEY) {
      return NextResponse.json(
        { error: "Server is not configured. Set API_URL, API_HOST, and API_KEY." },
        { status: 500 }
      );
    }

    const endpoint = new URL(API_URL);
    let fetchUrl = endpoint.toString();

    const fetchInit: RequestInit = {
      method: METHOD,
      headers: {
        "X-RapidAPI-Key": API_KEY!,
        "X-RapidAPI-Host": API_HOST!,
      },
      signal: AbortSignal.timeout(20000),
    };

    if (METHOD === "GET") {
      endpoint.searchParams.set(URL_PARAM, url);
      fetchUrl = endpoint.toString();
    } else if (METHOD === "POST") {
      if (POST_FORMAT === "form") {
        fetchInit.headers = { ...fetchInit.headers, "content-type": "application/x-www-form-urlencoded" };
        fetchInit.body = new URLSearchParams({ [URL_PARAM]: url }).toString();
      } else {
        fetchInit.headers = { ...fetchInit.headers, "content-type": "application/json" };
        fetchInit.body = JSON.stringify({ [URL_PARAM]: url });
      }
    }

    // Debug log
    if (DEBUG) {
      const maskedKey = API_KEY ? `${API_KEY.slice(0, 4)}…${API_KEY.slice(-2)}` : "<none>";
      console.debug("[resolve] calling", { url: endpoint.toString(), method: METHOD, host: API_HOST, key: maskedKey });
    }

    const resp = await fetch(fetchUrl, fetchInit);
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: `Resolver error (${resp.status}): ${text || resp.statusText}` },
        { status: 502 }
      );
    }

    const rawText = await resp.text();
    let data: unknown = null;
    try { data = rawText ? JSON.parse(rawText) : null; } catch {}

    const normalized: Array<{ url: string; type: string; thumbnail?: string }> = [];

    const decodeHtmlEntities = (s: string) =>
      s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    const isThumbnailUrl = (url: string) => /thumbnail|thumb|_t|_small|_low|_preview|\/\d{3}x\d{3}\//i.test(url);

    // Helper to recursively walk unknown JSON for media URLs
    const walk = (node: unknown, depth = 0) => {
      if (depth > 6 || node == null) return;
      if (typeof node === "string") {
        const s = decodeHtmlEntities(node.trim());
        if (/^https?:\/\//i.test(s) && !isThumbnailUrl(s)) {
          const type = /\.(mp4|m4v|mov|webm|m3u8)(\?.*)?$/i.test(s) ? "video" : "image";
          normalized.push({ url: s, type });
        }
        return;
      }
      if (Array.isArray(node)) node.forEach((n) => walk(n, depth + 1));
      if (typeof node === "object") Object.values(node).forEach((v) => walk(v, depth + 1));
    };

    if (data) walk(data);

    if (!normalized.length) return NextResponse.json({ error: "Could not resolve media links for this URL." }, { status: 404 });

    return NextResponse.json({ media: normalized });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
