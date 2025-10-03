import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url");
    // content disposition: 'attachment' (default) forces download, 'inline' enables preview in <img>/<video>
    const dispositionParam = (searchParams.get("disposition") || "attachment").toLowerCase();
    const disposition: "attachment" | "inline" = dispositionParam === "inline" ? "inline" : "attachment";
    // Normalize common URL variants
    let mediaUrl = rawUrl?.trim() || "";
    if (mediaUrl.startsWith("//")) {
      mediaUrl = "https:" + mediaUrl; // protocol-relative -> https
    } else if (/^www\./i.test(mediaUrl)) {
      mediaUrl = `https://${mediaUrl}`; // missing scheme but has www.
    }

    if (!mediaUrl) {
      return new Response(JSON.stringify({ error: "Missing 'url' query param" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Basic validation
    try {
      new URL(mediaUrl);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL", url: mediaUrl }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    // Forward Range header for video/audio seeking support
    const rangeHeader = req.headers.get("range");
    const upstream = await fetch(mediaUrl, {
      signal: controller.signal,
      headers: rangeHeader ? { Range: rangeHeader } : undefined,
    });
    clearTimeout(timeout);

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      return new Response(JSON.stringify({ error: `Failed to fetch media (${upstream.status}): ${text || upstream.statusText}` }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstream.headers.get("content-length") || undefined;
    const contentRange = upstream.headers.get("content-range") || undefined;
    const acceptRanges = upstream.headers.get("accept-ranges") || undefined;
    const etag = upstream.headers.get("etag") || undefined;
    const lastModified = upstream.headers.get("last-modified") || undefined;

    // Derive a filename from the URL path
    const pathname = new URL(mediaUrl).pathname;
    const namePart = pathname.split("/").filter(Boolean).pop() || "download";
    const filename = namePart.includes(".") ? namePart : `${namePart}.bin`;

    // Build response headers, passing through key upstream values
    const headers: Record<string, string> = {
      "content-type": contentType,
      "cache-control": "no-store",
    };
    if (contentLength) headers["content-length"] = contentLength;
    if (contentRange) headers["content-range"] = contentRange;
    if (acceptRanges) headers["accept-ranges"] = acceptRanges;
    if (etag) headers["etag"] = etag;
    if (lastModified) headers["last-modified"] = lastModified;
    // Set disposition according to query param
    headers["content-disposition"] = `${disposition}; filename="${filename}"`;

    return new Response(upstream.body, {
      status: upstream.status, // e.g., 200 or 206 for range responses
      headers,
    });
  } catch (err: any) {
    const msg = err?.name === "AbortError" ? "Request timed out" : err?.message || "Unexpected error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
