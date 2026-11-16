import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SIGNUP_URL } from '../../links';
import { ORGANIZATION } from '../../structured-data';
import { SiteFooter } from '../../site-footer';
import { extractFaq } from '../faq';
import { getAllPosts, getPost } from '../posts';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return {};
  }
  const url = `https://privytics.com/blog/${post.slug}`;
  return {
    // absolute: the root layout appends " | Privytics" via title.template,
    // which pushed 14 of 22 post titles past SERP truncation (~60 chars).
    // Post titles already carry the brand where it earns its keep.
    title: { absolute: post.title },
    description: post.description,
    alternates: {
      canonical: url,
      types: { 'application/rss+xml': 'https://privytics.com/blog/feed.xml' },
    },
    openGraph: {
      type: 'article',
      url,
      siteName: 'Privytics',
      title: post.title,
      description: post.description,
      publishedTime: post.date || undefined,
      modifiedTime: post.updated || post.date || undefined,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Privytics' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/og.png'],
    },
  };
}

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

export default async function BlogPost({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    notFound();
  }

  const url = `https://privytics.com/blog/${post.slug}`;

  // Dates as full ISO 8601 with offset; date-only strings are valid but
  // engines treat the timezone as ambiguous.
  const toIso = (d: string | undefined) =>
    d ? `${d}T00:00:00+00:00` : undefined;

  // One @graph per article: the Article referencing the shared Organization
  // node by @id (site-wide entity graph), a BreadcrumbList, and, when the post
  // has a `## FAQ` section, a FAQPage built from the same prose the reader
  // sees. Roughly 140 hand-written Q&A pairs across the blog were invisible to
  // structured-data consumers before this.
  const faq = extractFaq(post.body);
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      {
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        image: ['https://privytics.com/og.png'],
        inLanguage: 'en',
        datePublished: toIso(post.date),
        dateModified: toIso(post.updated || post.date),
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        isPartOf: { '@id': 'https://privytics.com/#website' },
        author: { '@id': 'https://privytics.com/#organization' },
        publisher: { '@id': 'https://privytics.com/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Blog',
            item: 'https://privytics.com/blog',
          },
          { '@type': 'ListItem', position: 2, name: post.title, item: url },
        ],
      },
      ...(faq.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faq.map((item) => ({
                '@type': 'Question',
                name: item.q,
                acceptedAnswer: { '@type': 'Answer', text: item.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="legal">
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is generated from our own static content, not user input. */}
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        type="application/ld+json"
      />

      <header className="legal-nav">
        <a className="brand" href="/">
          <img alt="Privytics logo" src="/logo.svg" />
          Privytics
        </a>
        <a className="legal-back" href="/blog">
          All posts
        </a>
      </header>

      <main className="legal-prose">
        <h1>{post.title}</h1>
        <p className="blog-meta">
          {post.tag ? `${post.tag} · ` : ''}
          {formatDate(post.date)}
          {/* Render the check date whenever it exists; the old !== guard hid
              it on the 19 posts where updated equals the publish date, muting
              the freshness signal for readers and crawlers alike. */}
          {post.updated
            ? ` · facts checked ${formatDate(post.updated)}`
            : ''}
        </p>
        <Markdown remarkPlugins={[remarkGfm]}>{post.body}</Markdown>

        <aside className="post-cta">
          <h2>Try Privytics free</h2>
          <p>
            <a href="/">Cookieless, EU-hosted product analytics</a>. 10,000
            events a month free, with no credit card. Export your data any
            time.
          </p>
          <div className="post-cta-actions">
            <a className="btn btn-primary" href={SIGNUP_URL}>
              Start for free
            </a>
            <a className="btn btn-ghost" href="/docs">
              Read the docs
            </a>
          </div>
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}
