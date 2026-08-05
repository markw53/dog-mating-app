import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Authenticated/private areas — nothing indexable behind these
      disallow: ['/admin', '/dashboard', '/messages', '/profile', '/favorites', '/unauthorized'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
