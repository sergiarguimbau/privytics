/**
 * Central brand configuration for the Privytics dashboard.
 *
 * Privytics is an independent, commercially hosted service built on the
 * open-source OpenPanel analytics engine (AGPL-3.0). Privytics is not
 * affiliated with, endorsed by, or sponsored by OpenPanel.
 *
 * Keep all user-facing brand references pointing at this object so the
 * rebrand stays a small, rebase-friendly overlay on top of upstream.
 * Internal `@openpanel/*` package names are intentionally left unchanged.
 */
export const BRAND = {
  name: 'Privytics',
  domain: 'privytics.com',
  marketingUrl: 'https://privytics.com',
  dashboardUrl: 'https://app.privytics.com',
  docsUrl: 'https://privytics.com/docs',
  supportEmail: 'support@privytics.com',
  senderEmail: 'hello@privytics.com',
  // Factual attribution (AGPL + trademark compliant). Never used in
  // marketing headlines; only in footer / about / source disclosure.
  poweredBy: 'OpenPanel',
  sourceUrl: 'https://github.com/sergiarguimbau/privytics',
} as const;

export type Brand = typeof BRAND;
