import fs from 'node:fs';
import path from 'node:path';

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date, e.g. 2026-07-19 */
  date: string;
  /** Optional short label used on the index cards. */
  tag?: string;
  /** Optional last-review date for pages that quote competitor pricing. */
  updated?: string;
};

export type Post = PostMeta & { body: string };

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * Minimal frontmatter parser. Posts are plain markdown so they can contain
 * fenced code blocks without fighting TypeScript template literals, and we
 * avoid pulling another dependency into this app just to read six keys.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: raw };
  }
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // Strip matching surrounding quotes.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: match[2] };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const { data, body } = parseFrontmatter(raw);
      return {
        slug: data.slug || file.replace(/\.md$/, ''),
        title: data.title || file,
        description: data.description || '',
        date: data.date || '',
        tag: data.tag,
        updated: data.updated,
        body,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}
