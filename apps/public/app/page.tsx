import {
  DEMO_URL,
  LOGIN_URL,
  SIGNUP_URL,
  SOURCE_URL,
} from './links';
import { Reveal } from './reveal';
import { ProfileShowcase } from './profile-showcase';
import { COMPARE_LINKS } from './site-footer';
import { StatusIndicator } from './status-indicator';
import { StructuredData } from './structured-data';

const CONTACT_EMAIL = 'hello@privytics.com';
// Official OpenPanel resources we link to whenever we mention them, so the
// relationship stays transparent and legally clean (nominative use).
const OPENPANEL_URL = 'https://openpanel.dev';
const OPENPANEL_SELFHOST_URL =
  'https://openpanel.dev/docs/self-hosting/self-hosting';

const BAR_HEIGHTS = [38, 52, 46, 63, 71, 58, 84, 96];

// The anonymous, cookieless layer (on by default). A daily-rotating device ID
// (a salted hash of IP, user agent, and project), no cookies, no device storage.
const ANON_LAYER = [
  'Traffic, top pages, and referrers',
  'Custom events and goals',
  'Live visitors, in real time',
  'In-session funnels',
];

// The identified layer (you opt in by calling identify with your own user IDs).
// This is where persistent, cross-session, personal-data analytics happens.
const ID_LAYER = [
  'User profiles with your own traits',
  'Retention across days and weeks',
  'Cohorts grouped by behavior',
  'Revenue per user',
  'Cross-session funnels',
];

const ALL_FEATURES = [
  'Funnels',
  'Retention',
  'Cohorts',
  'User profiles',
  'User flows',
  'Session replay',
  'Revenue tracking',
  'Real-time dashboards',
  'Custom dashboards',
  'Event and funnel alerts',
  'Groups for accounts and teams',
  'AI access over MCP',
  'Raw data export and query API',
  'SDKs for web, mobile and server',
  'Consent gating built in',
  'Cookieless, with a GDPR DPA',
];

// Each chip links to its setup guide under /for. Those pages are what answer
// "analytics for <framework>" searches, so the landing page should feed them
// rather than dead-ending on a decorative list. REST API has no guide of its
// own and points at the docs instead.
const SDKS: { label: string; href: string }[] = [
  { label: 'HTML / Script', href: '/for/script-tag' },
  { label: 'JavaScript', href: '/for/javascript' },
  { label: 'React', href: '/for/react' },
  { label: 'Next.js', href: '/for/nextjs' },
  { label: 'Remix', href: '/for/remix' },
  { label: 'Vue', href: '/for/vue' },
  { label: 'Nuxt', href: '/for/nuxt' },
  { label: 'Astro', href: '/for/astro' },
  { label: 'WordPress', href: '/for/wordpress' },
  { label: 'Shopify', href: '/for/shopify' },
  { label: 'Node', href: '/for/node' },
  { label: 'Express', href: '/for/express' },
  { label: 'React Native', href: '/for/react-native' },
  { label: 'iOS (Swift)', href: '/for/swift' },
  { label: 'Android (Kotlin)', href: '/for/kotlin' },
  { label: 'Python', href: '/for/python' },
  { label: 'Ruby', href: '/for/ruby' },
  { label: 'Rust', href: '/for/rust' },
  { label: 'Java', href: '/for/java' },
  { label: 'REST API', href: '/docs' },
];

// Audience and platform guides the SDK grid does not already link.
const MORE_GUIDES: { label: string; href: string }[] = [
  { label: 'SaaS products', href: '/for/saas' },
  { label: 'Startups', href: '/for/startups' },
  { label: 'Side projects', href: '/for/side-projects' },
  { label: 'Webflow sites', href: '/for/webflow' },
  { label: 'Wix sites', href: '/for/wix' },
];

// Every account starts on the free plan and upgrades from the dashboard, so
// paid rows must not promise a tier selection that sign-up never makes.
const PAID_CTA = { label: 'Start free', href: SIGNUP_URL };

const PRICING: {
  events: string;
  price: string;
  per: string;
  featured?: boolean;
  cta?: { label: string; href: string };
}[] = [
  {
    events: '10,000 events',
    price: '€0',
    per: '',
    featured: true,
    cta: { label: 'Start for free', href: SIGNUP_URL },
  },
  { events: '100,000 events', price: '€10', per: '/mo' },
  { events: '500,000 events', price: '€20', per: '/mo' },
  { events: '1,000,000 events', price: '€40', per: '/mo' },
  { events: '5,000,000 events', price: '€100', per: '/mo' },
  { events: '10,000,000 events', price: '€200', per: '/mo' },
  {
    events: 'More than 10M events',
    price: 'Custom',
    per: '',
    cta: { label: 'Get in touch', href: `mailto:${CONTACT_EMAIL}` },
  },
];

const TRUST = [
  'Cookieless analytics',
  'EU-hosted',
  'GDPR DPA included',
  'Open-source engine',
  'Raw data export',
];

// `a` stays plain text because it also feeds the FAQPage JSON-LD. The optional
// link is rendered only in the visible answer.
const FAQ: { q: string; a: string; link?: { href: string; label: string } }[] =
  [
    {
      q: 'Is the free plan really free?',
      a: 'Yes. 10,000 events a month for one project, with twelve months of history, no credit card and no time limit.',
    },
    {
      q: 'What counts as an event?',
      a: 'Each page view and each custom event counts as one. Properties on an event never count extra, and the markers that open and close a session are not counted.',
    },
    {
      q: 'What happens if I go over 10,000 events?',
      a: 'Nothing is charged. On the free plan, new events pause until your next monthly period, and your dashboard stays available. Paid plans are not cut off at their tier limit: you get a warning and a prompt to upgrade.',
    },
    {
      q: 'Can Privytics replace Google Analytics?',
      a: 'It covers traffic, pages, referrers and custom events, plus funnels, retention and a timeline for each signed-in user, without cookies and with your analytics data stored in the EU. It does not replace Google Ads attribution or Search Console reports, so teams that rely on those often run both.',
      link: {
        href: '/blog/migrate-from-google-analytics-ga4-cookieless',
        label: 'How to switch from Google Analytics, step by step →',
      },
    },
    {
      q: 'Do you use cookies?',
      a: 'No. Privytics sets no cookies and stores nothing on your visitors’ devices, so anonymous analytics generally needs no cookie banner. If you identify users or record sessions, consent gating is built in for when you want to ask first.',
      link: {
        href: '/blog/cookieless-analytics-gdpr-cookie-banner',
        label: 'Do you still need a cookie banner? →',
      },
    },
    {
      q: 'Where is my data stored?',
      a: 'In the EU. All analytics event data is stored in data centres in Germany, and Privytics is operated from Spain.',
    },
    {
      q: 'Do ad blockers block it?',
      a: 'Less often than Google Analytics, but some do. The script is served from privytics.com, and you can route it through your own domain to recover the rest.',
      link: {
        href: '/blog/ad-blockers-analytics-first-party-proxy',
        label: 'Set up a first-party proxy →',
      },
    },
  ];

export default function Page() {
  return (
    <>
      <StructuredData faq={FAQ} />
      <nav className="nav">
        <div className="container nav-inner">
          <a className="brand" href="/">
            <img alt="Privytics logo" src="/logo.svg" />
            Privytics
          </a>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="/for">Guides</a>
            <a href="/blog">Blog</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-cta">
            <a
              className="nav-login"
              data-track="cta_clicked"
              data-cta="login"
              data-location="nav"
              href={LOGIN_URL}
            >
              Log in
            </a>
            <a
              className="btn btn-primary"
              data-track="cta_clicked"
              data-cta="signup"
              data-location="nav"
              href={SIGNUP_URL}
            >
              Start for free
            </a>
          </div>
        </div>
      </nav>

      {/* Landmark: the homepage was the only route without <main>. */}
      <main>

      <header className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Privacy-first product analytics</p>
            <h1>
              Know what your product does.{' '}
              <span className="h1-soft">Not who your visitors are.</span>
            </h1>
            <p className="sub">
              Every event in your product, tracked without cookies and stored in
              the EU. Free for your first 10,000 events a month.
            </p>
            <div className="hero-cta">
              <a
                className="btn btn-primary btn-lg"
                data-track="cta_clicked"
                data-cta="signup"
                data-location="hero"
                href={SIGNUP_URL}
              >
                Start for free
              </a>
              {/* No demo exists yet: point at pricing until DEMO_URL is set. */}
              {DEMO_URL ? (
                <a
                  className="btn btn-ghost btn-lg"
                  data-track="cta_clicked"
                  data-cta="demo"
                  data-location="hero"
                  href={DEMO_URL}
                  rel="noopener"
                  target="_blank"
                >
                  See a live demo
                </a>
              ) : (
                <a
                  className="btn btn-ghost btn-lg"
                  data-track="cta_clicked"
                  data-cta="pricing"
                  data-location="hero"
                  href="#pricing"
                >
                  See pricing
                </a>
              )}
            </div>
            <p className="hero-micro">
              No credit card. Set up in a few minutes.
            </p>
          </div>
          <HeroChart />
        </div>
      </header>

      <div className="trust">
        <div className="container trust-inner">
          {TRUST.map((item) => (
            <span className="trust-item" key={item}>
              <Check />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="profiles-section" id="profiles">
        <div className="container">
          <div className="profiles-grid">
            <Reveal>
              <div className="profiles-copy">
                <p className="eyebrow">Profiles</p>
                <h2>See what one signed-in user actually did.</h2>
                <p className="profiles-lead">
                  Charts tell you that checkout conversion dropped. Profiles tell
                  you that Ada, one of your signed-in users, installed the SDK,
                  came back twice, opened pricing three times, and abandoned at
                  the payment step. Every event a person triggers, in order, on
                  one page.
                </p>
                <ul className="check-list">
                  <li>A full event timeline per user, newest first</li>
                  <li>Sessions, popular events, and an activity heatmap</li>
                  <li>Filter to anonymous, identified, or your power users</li>
                  <li>Jump from any funnel drop-off straight to the people</li>
                </ul>
                <p className="profiles-note">
                  Anonymous by default: the visitor id is a daily-rotating hash,
                  so an anonymous timeline covers a day. Call{' '}
                  <code>identify()</code> with your own user id and the journey
                  continues across sessions, under your lawful basis.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <ProfileShowcase />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Two layers</p>
              <h2>Cookieless analytics by default. Identified when you choose.</h2>
            </div>
          </Reveal>

          <div className="two layers">
            <Reveal>
              <div className="layer">
                <span className="layer-tag anon">Anonymous, on by default</span>
                <h3>The essentials, for every visitor</h3>
                <ul className="check-list">
                  {ANON_LAYER.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="privacy-note">
                  A daily-rotating anonymous ID, with no cookies and no device
                  storage, so there is usually nothing to consent to.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="layer">
                <span className="layer-tag id">Identified, you opt in</span>
                <h3>The deeper picture, for logged-in users</h3>
                <ul className="check-list">
                  {ID_LAYER.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="privacy-note">
                  You pass the user IDs you already have, so this is personal
                  data. You choose the lawful basis, and built-in consent gating
                  lets you ask first when you need to.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="replay-callout">
              <div>
                <h3>Session replay, private by default</h3>
                <p>
                  Watch real sessions to see where people get stuck. Off until
                  you switch it on, with inputs and text masked in the browser
                  by default.
                </p>
              </div>
              <span className="replay-tag">Paid plans</span>
            </div>
          </Reveal>

        </div>
      </section>

      <section className="split">
        <div className="container split-grid">
          <Reveal>
            <div>
              <p className="eyebrow">No trial clock</p>
              <h2>A free plan, not a free trial.</h2>
              <p>
                10,000 events a month for one project, with funnels, retention,
                cohorts and user profiles included. No card to enter. Move to a
                paid plan when you outgrow it, or never. See how it compares
                with{' '}
                <a href="/blog/free-analytics-no-credit-card">
                  other free analytics tools
                </a>
                .
              </p>
              <div className="hero-cta">
                <a
                  className="btn btn-primary"
                  data-track="cta_clicked"
                  data-cta="signup"
                  data-location="free-plan"
                  href={SIGNUP_URL}
                >
                  Create your free project
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="stat-card">
              <div className="stat-row">
                <span className="big">10k</span>
                <span className="muted">events a month, free</span>
              </div>
              <div className="stat-row">
                <span className="big">12 mo</span>
                <span className="muted">of event history included</span>
              </div>
              <div className="stat-row">
                <span className="big">0</span>
                <span className="muted">cookies on your visitors’ devices</span>
              </div>
              <div className="stat-row">
                <span className="big">€0</span>
                <span className="muted">
                  charged if you go past 10,000, new events just pause
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="included">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">What you get</p>
              <h2>The full product analytics toolkit.</h2>
              <p>
                Every feature below is on every plan, including free. The one
                exception is session replay, which comes with paid plans and
                keeps recordings for 30 days.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="feature-check-grid">
              {ALL_FEATURES.map((f) => (
                <span className="feature-check" key={f}>
                  <Check />
                  {f}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Where privacy-first pays off against classic cookie-based tools.
          Every line here must stay within app/legal/content.json: event data
          is stored in the EU, but the privacy policy explicitly declines to
          say that no data ever leaves it. */}
      <section className="split">
        <div className="container split-grid">
          <Reveal>
            <div className="stat-card">
              <p style={{ fontWeight: 650, fontSize: '1.1rem' }}>
                Privacy by default
              </p>
              <ul className="check-list" style={{ marginTop: 14, marginBottom: 0 }}>
                <li>Nothing kept on the visitor’s device, and no cross-site profiles</li>
                <li>
                  Analytics data stored in EU data centres, with the services we
                  rely on listed openly in our{' '}
                  <a href="/privacy">privacy policy</a>
                </li>
                <li>
                  A GDPR <a href="/dpa">data processing agreement</a> on every
                  plan, free included
                </li>
                <li>
                  Your data stays yours: used only to run your analytics, never
                  for advertising, and exportable at any time
                </li>
              </ul>
            </div>
          </Reveal>
          <Reveal>
            <div>
              <p className="eyebrow">Cookieless and EU-hosted</p>
              <h2>Privacy-first analytics, without losing your numbers.</h2>
              <p>
                Cookie-based tools like Google Analytics usually need a consent
                banner in the EU, and every visitor who declines it goes
                unmeasured. Privytics sets no cookies, so its anonymous
                analytics generally needs no banner, and those visitors stay in
                your numbers. See the{' '}
                <a href="/blog/privytics-vs-google-analytics">
                  full comparison with Google Analytics
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="pricing">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Pricing</p>
              <h2>Free up to 10,000 events. Fixed monthly tiers after that.</h2>
              <p>
                Free covers one project and twelve months of history. Paid plans
                add session replay and five years of event history. Tiers are
                stepped, not metered, so a traffic spike inside your tier never
                changes the bill.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="pricing-table">
              {PRICING.map((tier) => {
                const cta = tier.cta ?? PAID_CTA;
                return (
                  <div
                    className={`price-row ${tier.featured ? 'featured' : ''}`}
                    key={tier.events}
                  >
                    <span className="price-events">
                      {tier.events}
                      {tier.featured ? (
                        <span
                          className="price-tag"
                          style={{ marginLeft: 10 }}
                        >
                          Free
                        </span>
                      ) : null}
                    </span>
                    <span className="price-amount">
                      {tier.price}
                      {tier.per ? <span> {tier.per}</span> : null}
                    </span>
                    <a
                      className={`btn ${tier.featured ? 'btn-primary' : 'btn-ghost'}`}
                      data-track="cta_clicked"
                      data-cta={tier.price === 'Custom' ? 'contact' : 'signup'}
                      data-location="pricing"
                      data-plan={tier.events}
                      href={cta.href}
                    >
                      {cta.label}
                    </a>
                  </div>
                );
              })}
            </div>
          </Reveal>
          <p className="pricing-note">
            Every account starts free, and you upgrade from your dashboard when
            you need more. Prices exclude VAT, which is handled at checkout.
          </p>
        </div>
      </section>

      <section className="opensource">
        <div className="container">
          <Reveal>
            <div className="os-card">
              <p className="eyebrow">No lock-in, ever</p>
              <h2>Built on open source, so the exit is always open.</h2>
              <p>
                Privytics runs on{' '}
                <a href={OPENPANEL_URL} rel="noopener" target="_blank">
                  OpenPanel
                </a>
                , an open-source analytics engine. You track with the standard
                OpenPanel SDKs and can export all your data, so you can{' '}
                <a href={OPENPANEL_SELFHOST_URL} rel="noopener" target="_blank">
                  self-host the engine
                </a>{' '}
                or move to OpenPanel&rsquo;s own cloud at any time. What
                Privytics adds is the offer around it: we run it for you, with a
                free plan that has no time limit and prices in euros.{' '}
                <a href="/blog/privytics-vs-openpanel">
                  See how Privytics and OpenPanel Cloud compare
                </a>
                .
              </p>
              <p className="os-note">
                Privytics is an independent service and is not affiliated with,
                endorsed by, or sponsored by OpenPanel.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="sdks">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Works with your stack</p>
              <h2>Drop it into anything you build.</h2>
              <p>
                A script tag, an SDK, or plain HTTP from any backend. A few lines
                of code and you are tracking. Pick your stack for a setup guide.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="sdk-grid">
              {SDKS.map((s) => (
                <a className="sdk-card" href={s.href} key={s.label}>
                  {s.label}
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <p className="sdk-more">
              <a href="/for">Browse all setup guides →</a>
            </p>
          </Reveal>
        </div>
      </section>

      <section id="faq">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <p className="eyebrow">Questions</p>
              <h2>Good to know.</h2>
            </div>
          </Reveal>
          <Reveal>
            <div className="faq">
              {FAQ.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>
                    {item.a}
                    {item.link ? (
                      <>
                        {' '}
                        <a href={item.link.href}>{item.link.label}</a>
                      </>
                    ) : null}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal>
            <div className="cta-final">
              <h2>See your first events today, without a single cookie.</h2>
              <p>
                10,000 events a month free. No credit card, no time limit, and a
                few minutes to set up.
              </p>
              <a
                className="btn btn-primary btn-lg"
                data-track="cta_clicked"
                data-cta="signup"
                data-location="final"
                href={SIGNUP_URL}
              >
                Start for free
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      </main>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand" href="/">
                <img alt="Privytics logo" src="/logo.svg" />
                Privytics
              </a>
              <p>Privacy-first product analytics, hosted in the EU.</p>
              <StatusIndicator />
            </div>
            <div className="footer-col">
              <h4>Compare</h4>
              {COMPARE_LINKS.map((l) => (
                <a href={l.href} key={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/dpa">DPA</a>
              <a href="/cookie">Cookies</a>
              <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
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
              <a href={SOURCE_URL}>Source code</a>
            </div>
            <div className="footer-col">
              <h4>Analytics for</h4>
              {MORE_GUIDES.map((g) => (
                <a href={g.href} key={g.href}>
                  {g.label}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              Built on the open-source{' '}
              <a href={OPENPANEL_URL} rel="noopener" target="_blank">
                OpenPanel
              </a>{' '}
              engine. Independent service, not affiliated with OpenPanel.{' '}
              <a href={SOURCE_URL} rel="noopener" target="_blank">
                Source code
              </a>
              {/* Required attribution for the GeoLite2 data behind country
                  and city lookups (CC BY-SA 4.0). */}
              . Includes GeoLite2 data created by{' '}
              <a href="https://www.maxmind.com" rel="noopener" target="_blank">
                MaxMind
              </a>
              .
            </span>
            <span>&copy; 2026 Privytics</span>
          </div>
        </div>
      </footer>
    </>
  );
}

function HeroChart() {
  return (
    <div className="chart" aria-hidden="true">
      <div className="chart-head">
        <span className="chart-title">Signups this week</span>
        <span className="chart-value">
          1,284<span className="up">+18%</span>
        </span>
      </div>
      <div className="bars">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            className="bar"
            key={`${h}-${i}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg
      className="check"
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
    >
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}
