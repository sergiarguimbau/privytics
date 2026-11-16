import { getAllPosts } from '../blog/posts';

// Companion to /llms.txt. That file is a link index; an agent following it
// would have to fetch and de-chrome 22+ HTML pages to read the content. This
// endpoint serves every article as clean markdown in one fetch, which is the
// emerging llms-full.txt convention. Static, generated at build time.
export const dynamic = 'force-static';

const BASE = 'https://privytics.com';

export function GET() {
  const posts = [...getAllPosts()].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const articles = posts
    .map((post) => {
      const updated =
        post.updated && post.updated !== post.date
          ? ` (updated ${post.updated})`
          : '';
      return `# ${post.title}

URL: ${BASE}/blog/${post.slug}
Published: ${post.date}${updated}

${post.body.trim()}`;
    })
    .join('\n\n---\n\n');

  const body = `# Privytics: all articles

Full text of every article on ${BASE}/blog, newest first. For the product
summary, pricing and setup guides index, see ${BASE}/llms.txt.

---

${articles}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
