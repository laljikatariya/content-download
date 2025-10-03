import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: (origin, cb) => {
      const allowAll = process.env.CORS_ALLOW_ALL === 'true';
      if (allowAll || !origin) return cb(null, true);
      const whitelist = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (!whitelist.length || whitelist.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
  })
);

// Utilities shared by routes
const API_URL = process.env.INSTAGRAM_SCRAPER_API_URL;
const API_HOST = process.env.INSTAGRAM_SCRAPER_API_HOST;
const API_KEY = process.env.INSTAGRAM_SCRAPER_API_KEY;
const URL_PARAM = process.env.INSTAGRAM_SCRAPER_URL_PARAM || 'url';
const METHOD = (process.env.INSTAGRAM_SCRAPER_METHOD || 'GET').toUpperCase();
const POST_FORMAT = (process.env.INSTAGRAM_SCRAPER_POST_FORMAT || 'json').toLowerCase();
const MOCK = process.env.INSTAGRAM_SCRAPER_MOCK === 'true';
const DEBUG = process.env.INSTAGRAM_SCRAPER_DEBUG === 'true';

// Route: POST /api/resolve
app.post('/api/resolve', async (req, res) => {
  try {
    const { url } = req.body || {};
    if (typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ error: "Invalid request. 'url' is required." });
    }

    if (MOCK) {
      const sample = [
        {
          url: 'https://example.com/sample-image.jpg',
          type: 'image',
          thumbnail: 'https://picsum.photos/seed/insta1/640/360',
        },
        {
          url: 'https://example.com/sample-video.mp4',
          type: 'video',
          thumbnail: 'https://picsum.photos/seed/insta2/640/360',
        },
      ];
      return res.json({ media: sample });
    }

    if (!API_URL || !API_HOST || !API_KEY) {
      return res.status(500).json({
        error:
          'Server is not configured. Set INSTAGRAM_SCRAPER_API_URL, INSTAGRAM_SCRAPER_API_HOST, and INSTAGRAM_SCRAPER_API_KEY in your environment.',
      });
    }

    const endpoint = new URL(API_URL);
    let fetchUrl = endpoint.toString();
    let fetchInit = {
      method: METHOD,
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
      signal: AbortSignal.timeout(20000),
    };

    if (METHOD === 'GET') {
      endpoint.searchParams.set(URL_PARAM, url);
      fetchUrl = endpoint.toString();
    } else if (METHOD === 'POST') {
      if (POST_FORMAT === 'form') {
        const body = new URLSearchParams({ [URL_PARAM]: url }).toString();
        fetchInit.headers = {
          ...fetchInit.headers,
          'content-type': 'application/x-www-form-urlencoded',
        };
        fetchInit.body = body;
      } else {
        fetchInit.headers = {
          ...fetchInit.headers,
          'content-type': 'application/json',
        };
        fetchInit.body = JSON.stringify({ [URL_PARAM]: url });
      }
    }

    try {
      const maskedKey = `${API_KEY.slice(0, 4)}…${API_KEY.slice(-2)}`;
      console.debug('[resolve] calling', {
        url: endpoint.toString(),
        method: METHOD,
        host: API_HOST,
        urlParam: URL_PARAM,
        postFormat: METHOD === 'POST' ? POST_FORMAT : undefined,
        key: maskedKey,
      });
    } catch {}

    const upstream = await fetch(fetchUrl, fetchInit);
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return res.status(502).json({
        error: `Resolver error (${upstream.status}): ${text || upstream.statusText}`,
        hint:
          'Verify INSTAGRAM_SCRAPER_API_URL path, INSTAGRAM_SCRAPER_API_HOST, METHOD/POST_FORMAT, and URL_PARAM match your RapidAPI endpoint.',
        requested: {
          url: fetchUrl,
          method: METHOD,
          host: API_HOST,
          urlParam: URL_PARAM,
          postFormat: METHOD === 'POST' ? POST_FORMAT : undefined,
        },
      });
    }

    const rawText = await upstream.text();
    let data = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {}

    const normalized = [];

    // Helper to decode HTML entities in URLs (e.g., &amp; -> &)
    const decodeHtmlEntities = (url) => {
      return url
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    };

    // Helper to check if a URL is likely a thumbnail (lower quality, smaller dimensions)
    const isThumbnailUrl = (url) => {
      const lower = url.toLowerCase();
      return (
        lower.includes('thumbnail') ||
        lower.includes('thumb') ||
        lower.includes('/t/') ||
        lower.includes('_t.') ||
        lower.includes('150x150') ||
        lower.includes('320x320') ||
        lower.includes('480x480') ||
        lower.includes('640x640') ||
        lower.includes('/s/') ||
        lower.includes('_s.') ||
        lower.includes('_small') ||
        lower.includes('_low') ||
        lower.includes('_preview') ||
        /\/\d{3}x\d{3}\//.test(lower) // matches /300x300/ or similar small dimensions
      );
    };

    if (Array.isArray(data?.media) && data.media.length) {
      for (const m of data.media) {
        // Only add if url exists and is not a thumbnail URL
        if (m?.url && !isThumbnailUrl(m.url)) {
          normalized.push({ url: decodeHtmlEntities(m.url), type: m.type || 'media', thumbnail: m.thumbnail });
        }
      }
    } else if (Array.isArray(data) && data.length && data[0]?.url) {
      for (const m of data) {
        if (m?.url && !isThumbnailUrl(m.url)) {
          normalized.push({ url: decodeHtmlEntities(m.url), type: m.type || 'media', thumbnail: m.thumbnail });
        }
      }
    } else if (data?.links && Array.isArray(data.links)) {
      for (const u of data.links) {
        if (typeof u === 'string' && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: 'media' });
        }
      }
    } else if (typeof data?.download_url === 'string' && !isThumbnailUrl(data.download_url)) {
      normalized.push({ url: decodeHtmlEntities(data.download_url), type: 'media' });
    } else if (typeof data?.media_url === 'string' && !isThumbnailUrl(data.media_url)) {
      normalized.push({ url: decodeHtmlEntities(data.media_url), type: 'media' });
    } else if (typeof data?.video_url === 'string' && !isThumbnailUrl(data.video_url)) {
      normalized.push({ url: decodeHtmlEntities(data.video_url), type: 'video' });
    } else if (typeof data?.image_url === 'string' && !isThumbnailUrl(data.image_url)) {
      normalized.push({ url: decodeHtmlEntities(data.image_url), type: 'image' });
    } else if (data?.result && Array.isArray(data.result)) {
      for (const m of data.result) {
        const u = m?.url || m?.download_url || m?.media_url;
        if (typeof u === 'string' && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: m?.type || 'media', thumbnail: m?.thumbnail });
        }
      }
    } else if (data?.items && Array.isArray(data.items)) {
      for (const it of data.items) {
        const u = it?.url || it?.display_url || it?.video_url || it?.image_url;
        if (typeof u === 'string' && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: it?.video_url ? 'video' : it?.image_url ? 'image' : it?.type || 'media', thumbnail: it?.thumbnail || it?.display_url });
        }
      }
    } else if (Array.isArray(data?.images)) {
      for (const u of data.images) {
        if (typeof u === 'string' && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: 'image' });
        }
      }
    } else if (Array.isArray(data?.videos)) {
      for (const u of data.videos) {
        if (typeof u === 'string' && !isThumbnailUrl(u)) {
          normalized.push({ url: decodeHtmlEntities(u), type: 'video' });
        }
      }
    }

    if (!normalized.length) {
      const isHttp = (s) => /^https?:\/\//i.test(s);
      const isImage = (s) => /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(s);
      const isVideo = (s) => /\.(mp4|m4v|mov|webm|m3u8)(\?.*)?$/i.test(s);
      const seen = new Set();
      const candidates = [];

      const walk = (node, depth = 0) => {
        if (depth > 6) return;
        if (node == null) return;
        if (typeof node === 'string') {
          const s = decodeHtmlEntities(node.trim());
          if (isHttp(s) && !seen.has(s) && !isThumbnailUrl(s)) {
            if (isVideo(s)) {
              candidates.push({ url: s, type: 'video' });
              seen.add(s);
            } else if (isImage(s)) {
              candidates.push({ url: s, type: 'image' });
              seen.add(s);
            }
          }
          return;
        }
        if (Array.isArray(node)) {
          for (const it of node) walk(it, depth + 1);
          return;
        }
        if (typeof node === 'object') {
          for (const key of Object.keys(node)) walk(node[key], depth + 1);
        }
      };

      try {
        if (data) walk(data);
      } catch {}

      if (!candidates.length && typeof rawText === 'string' && rawText) {
        const urlRegex = /https?:\/\/[^\s"'<>]+/g;
        const matches = rawText.match(urlRegex) || [];
        for (const s of matches) {
          const decoded = decodeHtmlEntities(s);
          if (!seen.has(decoded) && !isThumbnailUrl(decoded) && (isImage(decoded) || isVideo(decoded))) {
            candidates.push({ url: decoded, type: isVideo(decoded) ? 'video' : 'image' });
            seen.add(decoded);
          }
        }
      }

      for (const c of candidates.slice(0, 20)) {
        normalized.push({ url: c.url, type: c.type });
      }
    }

    // If we have videos, remove any images (which are likely thumbnails for the video)
    const hasVideo = normalized.some((m) => m.type === 'video');
    let finalMedia = hasVideo 
      ? normalized.filter((m) => m.type === 'video')
      : normalized;

    // For images: remove duplicates and prefer higher quality versions
    // Keep only unique images by comparing URLs (remove query params for comparison)
    if (!hasVideo && finalMedia.length > 1) {
      const imageMap = new Map();
      
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
      if (DEBUG) {
        let debugKeys = undefined;
        try {
          if (data && typeof data === 'object') {
            debugKeys = Object.keys(data).slice(0, 20);
          }
        } catch {}
        const rawSnippet = typeof rawText === 'string' ? rawText.slice(0, 1000) : undefined;
        return res.status(404).json({
          error: 'Could not resolve media links for this URL.',
          debug: {
            keys: debugKeys,
            rawSnippet,
            requested: {
              url: fetchUrl,
              method: METHOD,
              host: API_HOST,
              urlParam: URL_PARAM,
              postFormat: METHOD === 'POST' ? POST_FORMAT : undefined,
            },
          },
        });
      }
      return res.status(404).json({ error: 'Could not resolve media links for this URL.' });
    }

    return res.json({ media: finalMedia });
  } catch (err) {
    const msg = err?.message || 'Unexpected error';
    return res.status(500).json({ error: msg });
  }
});

// Route: GET /api/download
app.get('/api/download', async (req, res) => {
  try {
    const rawUrl = req.query.url;
    const dispositionParam = String(req.query.disposition || 'attachment').toLowerCase();
    const disposition = dispositionParam === 'inline' ? 'inline' : 'attachment';

    let mediaUrl = (typeof rawUrl === 'string' ? rawUrl : '').trim();
    if (mediaUrl.startsWith('//')) mediaUrl = 'https:' + mediaUrl;
    else if (/^www\./i.test(mediaUrl)) mediaUrl = `https://${mediaUrl}`;

    if (!mediaUrl) {
      return res.status(400).json({ error: "Missing 'url' query param" });
    }

    try {
      new URL(mediaUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL', url: mediaUrl });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const rangeHeader = req.header('range');
    const upstream = await fetch(mediaUrl, {
      signal: controller.signal,
      headers: rangeHeader ? { Range: rangeHeader } : undefined,
    });
    clearTimeout(timeout);

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '');
      return res
        .status(502)
        .json({ error: `Failed to fetch media (${upstream.status}): ${text || upstream.statusText}` });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length') || undefined;
    const contentRange = upstream.headers.get('content-range') || undefined;
    const acceptRanges = upstream.headers.get('accept-ranges') || undefined;
    const etag = upstream.headers.get('etag') || undefined;
    const lastModified = upstream.headers.get('last-modified') || undefined;

    const pathname = new URL(mediaUrl).pathname;
    const namePart = pathname.split('/').filter(Boolean).pop() || 'download';
    const filename = namePart.includes('.') ? namePart : `${namePart}.bin`;

    res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'no-store');
    if (contentLength) res.setHeader('content-length', contentLength);
    if (contentRange) res.setHeader('content-range', contentRange);
    if (acceptRanges) res.setHeader('accept-ranges', acceptRanges);
    if (etag) res.setHeader('etag', etag);
    if (lastModified) res.setHeader('last-modified', lastModified);
    res.setHeader('content-disposition', `${disposition}; filename="${filename}"`);

    res.status(upstream.status);
    upstream.body.pipe(res);
  } catch (err) {
    const msg = err?.name === 'AbortError' ? 'Request timed out' : err?.message || 'Unexpected error';
    return res.status(500).json({ error: msg });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
