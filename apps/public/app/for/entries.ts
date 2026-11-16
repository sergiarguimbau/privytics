import fs from 'node:fs';
import path from 'node:path';

/**
 * Per-SDK and per-audience landing pages.
 *
 * Each page answers one search intent ("analytics react native", "analytics for
 * my side project") with a working setup guide rather than a marketing page, so
 * it is useful to a human skimming for a snippet and quotable to a generative
 * engine answering the same question. The content lives in JSON under
 * content/for so the copy can be regenerated and fact-checked independently of
 * the template that renders it.
 */

export type Step = {
  title: string;
  body: string;
  /** Fence language for the snippet. Omitted when a step has no code. */
  lang?: string;
  code?: string;
};

export type Why = { title: string; body: string };
export type Faq = { q: string; a: string };

export type Entry = {
  slug: string;
  /** `sdk` pages document an integration; `usecase` pages target an audience. */
  kind: 'sdk' | 'usecase';
  name: string;
  category: Category;
  title: string;
  description: string;
  tagline: string;
  intro: string;
  why: Why[];
  steps: Step[];
  faq: Faq[];
  /** Upstream OpenPanel docs for this SDK, when one exists. */
  docsUrl?: string;
  /**
   * Provenance kept from generation: what the copy was written from, and what
   * was deliberately left out or corrected. Never rendered; this is an audit
   * trail for whoever edits the page next.
   */
  sourcesUsed?: string[];
  omitted?: string[];
};

export const CATEGORY_ORDER = ['Web', 'Mobile', 'Backend', 'Audience'] as const;
export type Category = (typeof CATEGORY_ORDER)[number];

/** Short label shown above each group on the hub page. */
export const CATEGORY_BLURB: Record<Category, string> = {
  Web: 'Browser and full-stack frameworks.',
  Mobile: 'Native and cross-platform apps.',
  Backend: 'Server-side events that ad blockers never touch.',
  Audience: 'Written for a kind of project rather than a framework.',
};

/**
 * Curated "you might also want" links, keyed by slug. Without this, the related
 * section on each guide falls back to same-category order, which is alphabetical
 * (getAllEntries sorts by name) and buries the most relevant sibling: WooCommerce
 * would never surface WordPress, the guide it literally depends on. Listed slugs
 * lead the related section; the rest is filled by category. Relationships are
 * one-directional, so add both sides where the affinity is mutual.
 */
export const RELATED: Record<string, string[]> = {
  // Audience pages point at the platform guides they funnel into.
  ecommerce: ['shopify', 'woocommerce', 'bigcommerce', 'wix'],
  bloggers: ['wordpress', 'ghost', 'squarespace'],
  agencies: ['webflow', 'wordpress', 'shopify'],
  // Ecommerce, plus WooCommerce's dependency on the WordPress install.
  woocommerce: ['wordpress', 'shopify', 'bigcommerce'],
  wordpress: ['woocommerce', 'ghost', 'squarespace'],
  shopify: ['bigcommerce', 'woocommerce', 'wix'],
  bigcommerce: ['shopify', 'woocommerce'],
  // No-code site builders and CMSs.
  webflow: ['framer', 'squarespace', 'wix'],
  framer: ['webflow', 'squarespace'],
  squarespace: ['wix', 'webflow', 'framer'],
  wix: ['squarespace', 'webflow', 'shopify'],
  ghost: ['wordpress', 'squarespace'],
  drupal: ['wordpress', 'ghost'],
  // JavaScript frameworks.
  react: ['nextjs', 'remix', 'vue'],
  nextjs: ['react', 'remix', 'nuxt'],
  remix: ['react', 'nextjs'],
  vue: ['nuxt', 'react'],
  nuxt: ['vue', 'nextjs'],
  astro: ['nextjs', 'vue'],
  javascript: ['react', 'script-tag'],
  'script-tag': ['javascript', 'wordpress'],
};

const CONTENT_DIR = path.join(process.cwd(), 'content', 'for');

let cache: Entry[] | undefined;

export function getAllEntries(): Entry[] {
  if (cache) {
    return cache;
  }
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const entries = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith('.json'))
    .map(
      (file) =>
        JSON.parse(
          fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')
        ) as Entry
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  cache = entries;
  return entries;
}

export function getEntry(slug: string): Entry | undefined {
  return getAllEntries().find((entry) => entry.slug === slug);
}

export function getEntriesByCategory(): { category: Category; entries: Entry[] }[] {
  const all = getAllEntries();
  return CATEGORY_ORDER.map((category) => ({
    category,
    entries: all.filter((entry) => entry.category === category),
  })).filter((group) => group.entries.length > 0);
}
