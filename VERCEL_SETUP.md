# Vercel Environment Variables Setup

To see your updated modern website on Vercel with the correct API configuration, you need to set up environment variables in your Vercel project dashboard.

## Steps to Configure Vercel Environment Variables:

### 1. Go to Vercel Dashboard
Visit: https://vercel.com/laljikatariyas-projects/content-download-vxtd/settings/environment-variables

### 2. Add the Following Environment Variables:

#### Required Variables:
```
INSTAGRAM_SCRAPER_API_URL=<your-instagram-api-url>
INSTAGRAM_SCRAPER_API_HOST=<your-api-host>
INSTAGRAM_SCRAPER_API_KEY=<your-api-key>
```

#### Optional Variables (with defaults):
```
INSTAGRAM_SCRAPER_URL_PARAM=url
INSTAGRAM_SCRAPER_METHOD=GET
INSTAGRAM_SCRAPER_POST_FORMAT=json
INSTAGRAM_SCRAPER_MOCK=false
INSTAGRAM_SCRAPER_DEBUG=false
```

#### For Frontend (if using external API base):
```
NEXT_PUBLIC_API_BASE=<your-api-base-url>
```

### 3. Set Environment for Each Variable:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Redeploy After Setting Variables:
After adding all environment variables, trigger a new deployment:

```bash
vercel --prod
```

Or simply push to GitHub - Vercel will auto-deploy.

## Current API Configuration

Your app uses these API endpoints:
- **Internal API Route**: `/api/resolve` (Next.js API route)
- **Download Route**: `/api/download` (for file downloads)

Both routes proxy requests to the Instagram scraper API defined by your environment variables.

## Troubleshooting

If the website still shows old version:
1. ✅ Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. ✅ Check Vercel deployment logs
3. ✅ Verify environment variables are set correctly
4. ✅ Ensure you're visiting the production URL (not preview)

## Production URLs

Your production site should be accessible at:
- Main domain: `content-download-vxtd.vercel.app`
- Or custom domain if configured

## Local Development

For local development, create a `.env.local` file:

```bash
# .env.local (DO NOT commit this file)
INSTAGRAM_SCRAPER_API_URL=your-api-url
INSTAGRAM_SCRAPER_API_HOST=your-api-host
INSTAGRAM_SCRAPER_API_KEY=your-api-key
INSTAGRAM_SCRAPER_URL_PARAM=url
INSTAGRAM_SCRAPER_METHOD=GET
INSTAGRAM_SCRAPER_POST_FORMAT=json
INSTAGRAM_SCRAPER_MOCK=false
INSTAGRAM_SCRAPER_DEBUG=true
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

Run locally:
```bash
npm run dev
```
