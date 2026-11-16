import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SIGNUP_URL } from '../../links';
import { SiteFooter } from '../../site-footer';
import {
  type Category,
  type Entry,
  getAllEntries,
  getEntry,
  RELATED,
} from '../entries';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) {
    return {};
  }
  const url = `https://privytics.com/for/${entry.slug}`;
  return {
    // absolute: stops the root title.template appending " | Privytics",
    // which pushed several guide titles past SERP truncation.
    title: { absolute: entry.title },
    description: entry.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      siteName: 'Privytics',
      title: entry.title,
      description: entry.description,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Privytics' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description: entry.description,
      images: ['/og.png'],
    },
  };
}

/**
 * Structured data. `HowTo` describes the setup steps and `FAQPage` the
 * questions, which is what lets an assistant answering "how do I add analytics
 * to Astro" quote the actual steps rather than paraphrasing the page.
 */
function schemasFor(entry: Entry, url: string) {
  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: entry.title,
    description: entry.description,
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: '0',
    },
    step: entry.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.body,
      url: `${url}#step-${index + 1}`,
    })),
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entry.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  // The page renders a visible "Guides / <Category>" breadcrumb; this is its
  // machine-readable counterpart.
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Guides',
        item: 'https://privytics.com/for',
      },
      { '@type': 'ListItem', position: 2, name: entry.title, item: url },
    ],
  };

  return [howTo, faqPage, breadcrumbs];
}

/**
 * Related pages: curated affinities first (see RELATED), then same category, then
 * the rest. Without the curated step this falls back to alphabetical same-category
 * order, which would hide the most relevant sibling (e.g. WordPress on the
 * WooCommerce page).
 */
function relatedTo(entry: Entry): Entry[] {
  const all = getAllEntries().filter((item) => item.slug !== entry.slug);
  const bySlug = new Map(all.map((item) => [item.slug, item]));

  const curated = (RELATED[entry.slug] ?? [])
    .map((slug) => bySlug.get(slug))
    .filter((item): item is Entry => Boolean(item));
  const picked = new Set(curated.map((item) => item.slug));

  const sameCategory = all.filter(
    (item) => item.category === entry.category && !picked.has(item.slug)
  );
  const rest = all.filter(
    (item) => item.category !== entry.category && !picked.has(item.slug)
  );
  return [...curated, ...sameCategory, ...rest].slice(0, 6);
}

export default async function ForPage({ params }: Params) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) {
    notFound();
  }

  const url = `https://privytics.com/for/${entry.slug}`;
  const schemas = schemasFor(entry, url);
  const related = relatedTo(entry);
  const tint = entry.category.toLowerCase();

  return (
    <div className="for-page" data-tint={tint}>
      {schemas.map((schema) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={schema['@type']}
          type="application/ld+json"
        />
      ))}

      <header className="legal-nav">
        <a className="brand" href="/">
          <img alt="Privytics logo" src="/logo.svg" />
          Privytics
        </a>
        <a className="legal-back" href="/for">
          All guides
        </a>
      </header>

      <main>
        <section className="for-hero">
          <div className="for-inner">
            <p className="eyebrow">
              <a href="/for">Guides</a>
              <span aria-hidden="true"> / </span>
              {entry.category}
            </p>
            <h1>{entry.title}</h1>
            <p className="for-tagline">{entry.tagline}</p>
            <div className="for-hero-actions">
              <a className="btn btn-primary" href={SIGNUP_URL}>
                Start for free
              </a>
              <a className="btn btn-ghost" href="#setup">
                Jump to setup
              </a>
            </div>
            <p className="for-intro">{entry.intro}</p>
          </div>
        </section>

        <section className="for-why">
          <div className="for-inner">
            <h2>Why {entry.name} teams use Privytics</h2>
            <div className="for-why-grid">
              {entry.why.map((item) => (
                <article className="for-why-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="for-setup" id="setup">
          <div className="for-inner">
            <h2>Set it up</h2>
            <p className="for-setup-lede">
              About five minutes, on the free plan, without a credit card.
            </p>
            <ol className="for-steps">
              {entry.steps.map((step, index) => (
                <li className="for-step" id={`step-${index + 1}`} key={step.title}>
                  <div className="for-step-head">
                    <span aria-hidden="true" className="for-step-num">
                      {index + 1}
                    </span>
                    <h3>{step.title}</h3>
                  </div>
                  <p>{step.body}</p>
                  {step.code ? (
                    <pre className="for-code">
                      <code>{step.code}</code>
                    </pre>
                  ) : null}
                </li>
              ))}
            </ol>
            {entry.docsUrl ? (
              <p className="for-docs-note">
                Privytics runs the open-source OpenPanel engine, so the{' '}
                <a href={entry.docsUrl} rel="noopener" target="_blank">
                  upstream {entry.name} SDK reference
                </a>{' '}
                applies here too. Point <code>apiUrl</code> at Privytics and the
                data lands in your Privytics project.
              </p>
            ) : null}
          </div>
        </section>

        <section className="for-faq">
          <div className="for-inner">
            <h2>Questions</h2>
            <div className="faq">
              {entry.faq.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="for-cta">
          <div className="for-inner">
            <aside className="post-cta">
              <h2>Add Privytics to your {entry.name} project</h2>
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
          </div>
        </section>

        <section className="for-related">
          <div className="for-inner">
            <h2>Other guides</h2>
            <div className="for-related-grid">
              {related.map((item) => (
                <a
                  className="for-related-card"
                  data-tint={item.category.toLowerCase() as Lowercase<Category>}
                  href={`/for/${item.slug}`}
                  key={item.slug}
                >
                  <span className="for-related-name">{item.name}</span>
                  <span className="for-related-cat">{item.category}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
