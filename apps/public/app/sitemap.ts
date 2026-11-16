import type { MetadataRoute } from 'next';
import { getAllPosts } from './blog/posts';
import { getAllEntries } from './for/entries';

// Built entirely from content on disk, so it is fully known at build time.
// Required by `output: 'export'`, and a no-op on any other target.
export const dynamic = 'force-static';

const BASE = 'https://privytics.com';

// Keep in sync with the routes under apps/public/app.
const ROUTES: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/docs', priority: 0.8 },
  { path: '/blog', priority: 0.8 },
  { path: '/for', priority: 0.8 },
  { path: '/privacy', priority: 0.5 },
  { path: '/terms', priority: 0.5 },
  { path: '/dpa', priority: 0.5 },
  { path: '/cookie', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // lastModified is deliberately ABSENT for static routes and guides. The
  // previous build stamped `new Date()` on all of them, which told crawlers
  // that 42 URLs changed on every deploy; once Google proves lastmod dishonest
  // it ignores it site-wide, taking the blog's real dates down too. Omitting
  // lastmod is valid per the sitemap spec and strictly better than lying.
  // Blog posts keep honest dates from their frontmatter.
  const staticRoutes: MetadataRoute.Sitemap = ROUTES.map(
    ({ path, priority }) => ({
      url: `${BASE}${path}`,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority,
    })
  );

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    ...(post.updated || post.date
      ? { lastModified: new Date(`${post.updated || post.date}T00:00:00Z`) }
      : {}),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Setup guides. High priority: these are the pages that rank for
  // "analytics for <framework>" and they are the entry point for most
  // non-brand search traffic.
  const guides: MetadataRoute.Sitemap = getAllEntries().map((entry) => ({
    url: `${BASE}/for/${entry.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...posts, ...guides];
}
