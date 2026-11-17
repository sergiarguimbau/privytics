import type { Metadata } from 'next';
import { SIGNUP_URL } from '../links';
import { SiteFooter } from '../site-footer';
import {
  CATEGORY_BLURB,
  getAllEntries,
  getEntriesByCategory,
} from './entries';

const URL = 'https://privytics.com/for';

export const metadata: Metadata = {
  title: 'Privytics for your stack: setup guides for every SDK',
  description:
    'Cookieless, EU-hosted analytics for React, Next.js, React Native, Python, Swift and more. A working setup guide for each, plus guides for startups, SaaS and side projects.',
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    url: URL,
    siteName: 'Privytics',
    title: 'Privytics for your stack: setup guides for every SDK',
    description:
      'A working setup guide for every framework and language Privytics supports.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Privytics' }],
  },
  // Next replaces rather than merges twitter:*; without this block the hub
  // inherits the homepage title from the root layout.
  twitter: {
    card: 'summary_large_image',
    title: 'Privytics for your stack: setup guides for every SDK',
    description:
      'A working setup guide for every framework and language Privytics supports.',
    images: ['/og.png'],
  },
};

export default function ForIndex() {
  const groups = getEntriesByCategory();
  const total = getAllEntries().length;

  // ItemList so a crawler or assistant can enumerate the guides from one fetch
  // rather than discovering them link by link.
  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Privytics setup guides',
    numberOfItems: total,
    itemListElement: getAllEntries().map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.title,
      url: `https://privytics.com/for/${entry.slug}`,
    })),
  };

  return (
    <div className="for-page" data-tint="hub">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
        type="application/ld+json"
      />

      <header className="legal-nav">
        <a className="brand" href="/">
          <img alt="Privytics logo" src="/logo.svg" />
          Privytics
        </a>
        <a className="legal-back" href="/docs">
          Docs
        </a>
      </header>

      <main>
        <section className="for-hero">
          <div className="for-inner">
            <p className="eyebrow">Guides</p>
            <h1>Privytics for your stack.</h1>
            <p className="for-tagline">
              {total} setup guides. Pick your framework, copy about five lines,
              and you are tracking. Cookieless, EU-hosted, and free to
              10,000 events a month.
            </p>
            <div className="for-hero-actions">
              <a
                className="btn btn-primary"
                data-track="cta_clicked"
                data-cta="signup"
                data-location="guides-index"
                href={SIGNUP_URL}
              >
                Start for free
              </a>
              <a className="btn btn-ghost" href="/docs">
                Read the docs
              </a>
            </div>
          </div>
        </section>

        {groups.map((group) => (
          <section
            className="for-group"
            data-tint={group.category.toLowerCase()}
            key={group.category}
          >
            <div className="for-inner">
              <div className="for-group-head">
                <h2>{group.category}</h2>
                <p>{CATEGORY_BLURB[group.category]}</p>
              </div>
              <div className="for-grid">
                {group.entries.map((entry) => (
                  <a
                    className="for-card"
                    href={`/for/${entry.slug}`}
                    key={entry.slug}
                  >
                    <h3>{entry.name}</h3>
                    <p>{entry.tagline}</p>
                    <span className="for-card-go">Setup guide →</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      <SiteFooter />
    </div>
  );
}
