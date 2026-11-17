import { LOGIN_URL } from './links';
import { StatusIndicator } from './status-indicator';

/**
 * Shared footer for the secondary pages (docs, blog, legal).
 *
 * These pages previously carried a single line of text with no links, which
 * left them as dead ends: a reader who landed on a comparison post from search
 * had no way to reach the docs, the pricing, or the other posts. This mirrors
 * the landing footer's structure so the whole site reads as one place.
 */

// The comparison posts a visitor weighing alternatives wants next. Shared with
// the landing footer so both link the same commercial pages.
export const COMPARE_LINKS: { label: string; href: string }[] = [
  {
    label: 'Google Analytics alternatives',
    href: '/blog/best-google-analytics-alternatives-2026',
  },
  { label: 'vs Google Analytics', href: '/blog/privytics-vs-google-analytics' },
  { label: 'vs Plausible', href: '/blog/privytics-vs-plausible' },
  { label: 'vs Fathom', href: '/blog/privytics-vs-fathom' },
  { label: 'vs Mixpanel', href: '/blog/privytics-vs-mixpanel' },
];

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="site-foot-grid">
        <div className="site-foot-brand">
          <a className="brand" href="/">
            <img alt="Privytics logo" src="/logo.svg" />
            Privytics
          </a>
          <p>Privacy-first product analytics, hosted in the EU.</p>
          <StatusIndicator />
        </div>

        <div className="site-foot-col">
          <h4>Compare</h4>
          {COMPARE_LINKS.map((l) => (
            <a href={l.href} key={l.href}>
              {l.label}
            </a>
          ))}
        </div>

        <div className="site-foot-col">
          <h4>Resources</h4>
          <a href="/#pricing">Pricing</a>
          <a href="/docs">Docs</a>
          <a href="/for">Setup guides</a>
          <a href="/blog">Blog</a>
          <a
            data-track="cta_clicked"
            data-cta="login"
            data-location="footer"
            href={LOGIN_URL}
          >
            Log in
          </a>
        </div>

        <div className="site-foot-col">
          <h4>Popular guides</h4>
          <a href="/for/nextjs">Next.js</a>
          <a href="/for/react">React</a>
          <a href="/for/react-native">React Native</a>
          <a href="/for/script-tag">Script tag</a>
        </div>

        <div className="site-foot-col">
          <h4>Legal</h4>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/dpa">DPA</a>
          <a href="/cookie">Cookies</a>
        </div>
      </div>

      <div className="site-foot-bottom">
        <span>&copy; 2026 Privytics</span>
        <span>
          Built on the open-source{' '}
          <a href="https://openpanel.dev" rel="noopener" target="_blank">
            OpenPanel
          </a>{' '}
          engine. Independent service, not affiliated with OpenPanel.
        </span>
        {/* Required attribution for the GeoLite2 data behind country and city
            lookups (CC BY-SA 4.0). */}
        <span>
          Includes GeoLite2 data created by{' '}
          <a href="https://www.maxmind.com" rel="noopener" target="_blank">
            MaxMind
          </a>
          .
        </span>
      </div>
    </footer>
  );
}
