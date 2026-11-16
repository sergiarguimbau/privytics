import type { MetadataRoute } from 'next';
import { getAllPosts } from './blog/posts';
import { getAllEntries } from './for/entries';

// Built entirely from content on disk, so it is fully known at build time.
// Required by `output: 'export'`, and a no-op on any other target.
export const dynamic = 'force-static';

const BASE = 'https://privytics.com';

// lastmod dates are hand-maintained constants, never `new Date()`: a build
// that stamps "now" on every URL tells crawlers that everything changed on
// every deploy, and once Google proves lastmod dishonest it ignores it
// site-wide, taking the blog's real dates down too. Bump SITE_UPDATED when
// the home, /docs or /for copy materially changes, and LEGAL_UPDATED together
// with the "Last updated" line in app/legal/content.json.
const SITE_UPDATED = new Date('2026-11-16T00:00:00Z');
const LEGAL_UPDATED = new Date('2026-11-16T00:00:00Z');

// Keep in sync with the routes under apps/public/app.
// /blog has no lastModified: it changes whenever a post does.
const ROUTES: { path: string; priority: number; lastModified?: Date }[] = [
  { path: '', priority: 1, lastModified: SITE_UPDATED },
  { path: '/docs', priority: 0.8, lastModified: SITE_UPDATED },
  { path: '/blog', priority: 0.8 },
  { path: '/for', priority: 0.8, lastModified: SITE_UPDATED },
  { path: '/privacy', priority: 0.5, lastModified: LEGAL_UPDATED },
  { path: '/terms', priority: 0.5, lastModified: LEGAL_UPDATED },
  { path: '/dpa', priority: 0.5, lastModified: LEGAL_UPDATED },
  { path: '/cookie', priority: 0.5, lastModified: LEGAL_UPDATED },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Blog posts take honest dates from their frontmatter.
  const staticRoutes: MetadataRoute.Sitemap = ROUTES.map(
    ({ path, priority, lastModified }) => ({
      url: `${BASE}${path}`,
      lastModified,
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
    lastModified: SITE_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...posts, ...guides];
}
