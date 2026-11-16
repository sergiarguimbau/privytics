import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from './analytics';

// Leads with the idea the brand name encodes (privacy + analytics), with the
// brand last, matching the '%s | Privytics' template the rest of the site uses.
// The description sells the benefit instead of repeating the title. No replay
// in it: it is paid-only. The banner claim is scoped to anonymous tracking and
// hedged with 'generally', matching the cookie policy.
const title = 'Privacy-first analytics, cookieless and EU-hosted | Privytics';
const description =
  'No cookies, so anonymous tracking generally needs no consent banner. Funnels, retention and profiles, stored in the EU. 10,000 events a month free, no card.';

export const metadata: Metadata = {
  metadataBase: new URL('https://privytics.com'),
  title: {
    default: title,
    template: '%s | Privytics',
  },
  description,
  // './' resolves against metadataBase per route, giving every page a
  // self-referencing canonical. Deep pages that set absolute canonicals
  // (blog posts, /for guides) override this.
  alternates: { canonical: './' },
  applicationName: 'Privytics',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    url: 'https://privytics.com',
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
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0c6b69',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
