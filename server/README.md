# Windsurf Express Server (No MongoDB)

This server mirrors the Next.js API routes using Express, suitable for a MERN-style split without MongoDB.

## Features
- POST `/api/resolve`: proxies to a configured Instagram scraper (e.g., RapidAPI) and normalizes media output.
- GET `/api/download`: streams media from the source with `Content-Disposition` support and byte-range headers.
- CORS enabled and configurable.

## Requirements
- Node.js 18+

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in this directory with the following keys:
   ```env
   PORT=4000
   # Allow all origins in development (or set CORS_ORIGINS to a comma-separated list)
   CORS_ALLOW_ALL=true
   CORS_ORIGINS=http://localhost:3000

   # RapidAPI / Instagram scraper configuration
   INSTAGRAM_SCRAPER_API_URL=
   INSTAGRAM_SCRAPER_API_HOST=
   INSTAGRAM_SCRAPER_API_KEY=
   INSTAGRAM_SCRAPER_URL_PARAM=url
   INSTAGRAM_SCRAPER_METHOD=GET
   INSTAGRAM_SCRAPER_POST_FORMAT=json
   INSTAGRAM_SCRAPER_MOCK=false
   INSTAGRAM_SCRAPER_DEBUG=false
   ```

3. Run in development:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:4000`.

## Frontend (Next.js) configuration
Set the following in your Next.js `.env.local` (not committed):
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
```
This makes the frontend use the Express server instead of Next API routes.

## Notes
- If your RapidAPI provider uses a different parameter name or requires POST/form, adjust:
  - `INSTAGRAM_SCRAPER_URL_PARAM`
  - `INSTAGRAM_SCRAPER_METHOD`
  - `INSTAGRAM_SCRAPER_POST_FORMAT`
- For production, set `CORS_ALLOW_ALL=false` and specify `CORS_ORIGINS` with your real domains.
