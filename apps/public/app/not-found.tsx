import Link from 'next/link';
import { SiteFooter } from './site-footer';

// Styled 404. Without this file the static export ships Next's bare
// black-on-white error page with no navigation, which is both a dead end for
// visitors landing on a stale URL and a poor quality signal for crawlers.
export default function NotFound() {
  return (
    <div className="legal">
      <header className="legal-nav">
        <a className="brand" href="/">
          <img alt="Privytics logo" src="/logo.svg" />
          Privytics
        </a>
      </header>

      <main className="legal-prose">
        <h1>Page not found</h1>
        <p>
          The page you are looking for does not exist or has moved. The most
          useful places to go next:
        </p>
        <ul>
          <li>
            <Link href="/">Home: what Privytics is and what it costs</Link>
          </li>
          <li>
            <Link href="/for">Setup guides for every framework</Link>
          </li>
          <li>
            <Link href="/blog">Blog: comparisons and compliance guides</Link>
          </li>
          <li>
            <Link href="/docs">Documentation</Link>
          </li>
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
