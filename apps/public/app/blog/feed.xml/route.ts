import { getAllPosts } from '../posts';

// Static RSS 2.0 feed, generated at build time like every other route.
// Newsreaders, newsletter aggregators, and several AI-content pipelines use
// feeds as their change-detection mechanism; a blog without one is invisible
// to all of them. Advertised via <link rel="alternate"> on the blog pages.
export const dynamic = 'force-static';

const BASE = 'https://privytics.com';

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function GET() {
  const posts = [...getAllPosts()].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const items = posts
    .map((post) => {
      const url = `${BASE}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const newest = posts[0]?.date ?? '2026-01-01';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Privytics Blog</title>
    <link>${BASE}/blog</link>
    <description>Cookieless, EU-hosted product analytics: comparisons, compliance guides and how-tos.</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${newest}T00:00:00Z`).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
