/**
 * Structured data for the landing page.
 *
 * Two audiences: classic search crawlers (rich results) and generative engines,
 * which lean heavily on schema.org to extract concrete facts like price and
 * hosting region. The FAQ entries are passed in from the page's own FAQ array so
 * the markup can never drift from what a visitor actually sees, which is both a
 * Google requirement and the honest thing to do.
 */

import { SOURCE_URL } from './links';

// Exported so blog articles can embed the same node and reference it by @id,
// forming one site-wide entity graph instead of anonymous per-page objects.
export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': 'https://privytics.com/#organization',
  name: 'Privytics',
  url: 'https://privytics.com',
  logo: 'https://privytics.com/logo.png',
  email: 'hello@privytics.com',
  description:
    'Managed, privacy-first product analytics: cookieless, hosted in the EU and built on the open-source OpenPanel engine.',
  sameAs: [SOURCE_URL],
  address: {
    '@type': 'PostalAddress',
    streetAddress:
      'Carrer Isaac Newton, Edifici Disset, 3a planta, D-1, Parc Bit',
    postalCode: '07120',
    addressLocality: 'Palma de Mallorca',
    addressCountry: 'ES',
  },
};

const PRICE_TIERS: { name: string; price: string; events: string }[] = [
  { name: 'Free', price: '0', events: '10,000 events per month' },
  { name: '100k', price: '10', events: '100,000 events per month' },
  { name: '500k', price: '20', events: '500,000 events per month' },
  { name: '1M', price: '40', events: '1,000,000 events per month' },
  { name: '5M', price: '100', events: '5,000,000 events per month' },
  { name: '10M', price: '200', events: '10,000,000 events per month' },
];

const SOFTWARE = {
  '@type': 'SoftwareApplication',
  '@id': 'https://privytics.com/#software',
  name: 'Privytics',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Web and product analytics',
  operatingSystem: 'Web',
  url: 'https://privytics.com',
  publisher: { '@id': 'https://privytics.com/#organization' },
  featureList: [
    'Cookieless analytics with no device storage',
    'Analytics event data stored in EU data centres',
    'Funnels, retention and cohorts',
    'Custom events and user profiles',
    'Session replay on paid plans, masked by default',
    'Consent gating',
    'Data export and no lock-in',
    'GDPR Article 28 DPA on every plan, free included',
  ],
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '200',
    offerCount: PRICE_TIERS.length,
    offers: PRICE_TIERS.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      price: tier.price,
      priceCurrency: 'EUR',
      // Machine-readable version of the visible "/mo" and "Prices exclude VAT".
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: tier.price,
        priceCurrency: 'EUR',
        valueAddedTaxIncluded: false,
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1,
          unitCode: 'MON',
        },
      },
      description:
        tier.price === '0'
          ? `${tier.events}, no credit card`
          : `${tier.events}, with session replay and five years of event history`,
      url: 'https://privytics.com/#pricing',
    })),
  },
};

export function StructuredData({
  faq,
}: {
  // Items may carry extra fields for the visible FAQ (a follow-up link, say);
  // only the plain q and a strings are emitted below.
  faq: ReadonlyArray<{ q: string; a: string }>;
}) {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      SOFTWARE,
      {
        '@type': 'WebSite',
        '@id': 'https://privytics.com/#website',
        url: 'https://privytics.com',
        name: 'Privytics',
        publisher: { '@id': 'https://privytics.com/#organization' },
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://privytics.com/#faq',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from our own static content, never user input.
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      type="application/ld+json"
    />
  );
}
