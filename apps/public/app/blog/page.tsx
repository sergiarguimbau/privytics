import type { Metadata } from 'next';
import { getAllPosts } from './posts';
import { SiteFooter } from '../site-footer';
import { pageMetadata } from '../page-metadata';

// pageMetadata gives /blog its own OG/Twitter block instead of inheriting the
// homepage's. Its alternates carry the canonical, so merge, never overwrite.
const base = pageMetadata({
  path: '/blog',
  title: 'Blog: privacy-first analytics, compared honestly',
  description:
    'Practical guides and honest comparisons of privacy-first product analytics: Google Analytics, Plausible, Fathom, Umami, Matomo, Mixpanel, Amplitude, PostHog and OpenPanel.',
});

export const metadata: Metadata = {
  ...base,
  alternates: {
    ...base.alternates,
    types: { 'application/rss+xml': 'https://privytics.com/blog/feed.xml' },
  },
};

function formatDate(iso: string): string {
  if (!iso) {
    return '';
  }
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogIndex() {
  const posts = getAllPosts();

  // ItemList mirrors what /for already does for its guides: one fetch tells a
  // crawler or assistant every article that exists. The blog index previously
  // emitted no structured data at all.
  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Privytics blog',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: post.title,
      url: `https://privytics.com/blog/${post.slug}`,
    })),
  };

  return (
    <div className="legal">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from our own static content. */}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
        type="application/ld+json"
      />
      <header className="legal-nav">
        <a className="brand" href="/">
          <img alt="Privytics logo" src="/logo.svg" />
          Privytics
        </a>
        <a className="legal-back" href="/">
          Back to home
        </a>
      </header>

      <main className="legal-prose">
        <h1>Blog</h1>
        <p>
          Guides and comparisons about privacy-first analytics. We try to be
          useful rather than promotional: every comparison says plainly where
          the other tool is the better choice.
        </p>

        <ul className="blog-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <a href={`/blog/${post.slug}`}>
                <h2>{post.title}</h2>
              </a>
              <p>{post.description}</p>
              <small>
                {post.tag ? `${post.tag} · ` : ''}
                {formatDate(post.date)}
              </small>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
