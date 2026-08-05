import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/browse',
    '/breeds',
    '/map',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/login',
    '/register',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '/browse' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  // Breed guide pages are the long-tail search content — include every slug.
  // A dead API at build time must not break the sitemap, so fall back to
  // static routes only.
  let breedRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/breeds?limit=500`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const body = await res.json();
      const breeds: { slug: string; updatedAt?: string }[] = body.data || [];
      breedRoutes = breeds.map((breed) => ({
        url: `${SITE_URL}/breeds/${breed.slug}`,
        lastModified: breed.updatedAt ? new Date(breed.updatedAt) : undefined,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
    }
  } catch {
    // API unreachable — ship the static routes
  }

  return [...staticRoutes, ...breedRoutes];
}
