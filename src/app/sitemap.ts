import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date().toISOString();

  const routes: MetadataRoute.Sitemap = ['', '/privacy', '/terms', '/disclaimer'].map((path) => ({
    url: `${base}${path || '/'}`,
    lastModified: now,
    changeFrequency: 'weekly' as const, // ✅ Fix: narrow to literal type
    priority: path === '' ? 1 : 0.7,
  }));

  return routes;
}
