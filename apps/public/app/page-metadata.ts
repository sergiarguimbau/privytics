import type { Metadata } from 'next';

/**
 * Metadata for simple content pages (docs, legal, the blog index).
 *
 * Next.js REPLACES the `openGraph` object rather than deep-merging it, so a
 * page that sets none inherits the root layout's block wholesale, including
 * its hardcoded homepage `og:url` and homepage title. Five pages were
 * declaring themselves to be the homepage to every social and AI crawler.
 * This helper gives each page a complete, self-describing OG/Twitter block.
 */
export function pageMetadata({
  path,
  title,
  description,
}: {
  /** Route path with leading slash, e.g. '/privacy'. */
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `https://privytics.com${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      siteName: 'Privytics',
      title,
      description,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Privytics' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og.png'],
    },
  };
}
