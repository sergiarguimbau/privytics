---
slug: best-cookieless-analytics-tools-2026
title: "Best cookieless analytics tools 2026: which are truly cookieless"
description: "Which analytics tools set no cookies by default? Plausible, Fathom, Umami, Simple Analytics, OpenPanel, Matomo, PostHog and Privytics compared."
date: 2026-07-22
updated: 2026-11-27
tag: Comparison
---

Plausible, Fathom, Simple Analytics, Umami, OpenPanel and Privytics are cookieless by default: install them and they set no cookies. Matomo and PostHog can run without cookies, but only after you turn that on. Google Analytics 4 sets cookies.

The default is what counts. A tool that stores nothing on the visitor's device generally needs no cookie banner for anonymous analytics. GDPR still applies and the rules differ by country, so read [our guide to the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner) before you remove yours.

We run Privytics, and we say where another tool fits better.

## Cookieless by default

| Tool             | Free plan        | From     | Data stored in | Retention, cohorts |
|------------------|------------------|----------|----------------|--------------------|
| Fathom           | ✗ (7-day trial)  | $15/mo   | US ¹           | ✗                  |
| OpenPanel Cloud  | ✗ (30-day trial) | $2.50/mo | Germany        | ✓                  |
| Plausible        | ✗ (30-day trial) | $9/mo    | Germany        | ✗                  |
| Simple Analytics | ✓ (badge)        | €20/mo   | EU (mainly NL) | ✗                  |
| Umami Cloud      | 100k events/mo   | $20/mo   | US or EU       | ✓ ²                |
| Privytics        | 10k events/mo    | €10/mo   | Germany        | ✓ ³                |

¹ EU visitors' IPs are removed on EU servers; the anonymised data is stored in the US. ² Umami links logged-in users with `umami.identify()`. ³ For signed-in users you identify. Prices excl. VAT.

What sets each one apart:

- Plausible: focused web analytics with traffic, sources, pages and custom events on one clear dashboard. Funnels come with the Business plan, and every plan can import your Google Analytics data. ([vs Privytics](/blog/privytics-vs-plausible))
- Fathom: simple web analytics with revenue tracking and at least 50 sites on every plan. It has no funnels, and the trial needs a card. ([vs Privytics](/blog/privytics-vs-fathom))
- Simple Analytics: the free plan covers 5 websites with 30 days of history and needs a badge on your site. Goals, and the funnels built from them, need a paid plan. ([vs Privytics](/blog/privytics-vs-simple-analytics))
- Umami: the free Hobby plan gives 100k events a month for one website, with 6 months of history. Funnels and retention are on every plan, and you pick the US or EU region at sign-up. Each saved event property counts as one more event. ([vs Privytics](/blog/privytics-vs-umami))
- OpenPanel Cloud: the same open-source engine, dashboard and SDKs that Privytics runs on, with every feature on every plan. Approved open-source projects get up to 2.5M events a month free. Privytics is an independent service and is not affiliated with, endorsed by, or sponsored by OpenPanel. ([vs Privytics](/blog/privytics-vs-openpanel))
- Privytics: product analytics rather than page counts. Each visitor gets an anonymous ID that changes every day; nothing is stored on the device. Anonymous visitors give you traffic, custom events, in-session funnels and revenue; retention, cohorts and user profiles cover signed-in users you identify ([how that works](/blog/funnels-retention-cohorts-without-cookies)).

## Cookies by default

- Matomo comes closest to a full Google Analytics replacement, with ecommerce, SEO and site-search reports. It sets 3 cookies by default; cookieless is a setting you enable. Matomo Cloud starts at €22/mo for 50k hits after a 21-day trial, stores data in Germany and includes funnels and cohorts. ([vs Privytics](/blog/privytics-vs-matomo))
- PostHog is an all-in-one suite with product analytics, feature flags, experiments and surveys, among other tools. By default it sets a cookie that lasts a year, and it stores data in the US or EU. Its opt-in cookieless mode uses a daily ID like ours, but location and bot detection stop working. ([vs Privytics](/blog/privytics-vs-posthog))
- Google Analytics 4 sets cookies, generally needs consent in the EU and has no EU-only storage option. If that is why you are leaving, see [the best Google Analytics alternatives](/blog/best-google-analytics-alternatives-2026).

## When another tool is the better choice

- You only need traffic stats on a simple dashboard: Plausible, Fathom or Simple Analytics. Down to the first two? Read [Plausible vs Fathom](/blog/plausible-vs-fathom).
- You want a bigger free allowance: Umami Cloud (100k events) or PostHog (1M events, with cookies by default). More in [free analytics with no credit card](/blog/free-analytics-no-credit-card).
- You need ecommerce or site-search reports: Matomo.
- You need feature flags, experiments or surveys: PostHog.
- You want to host it yourself: Umami, Plausible's Community Edition, Matomo or OpenPanel.

## When Privytics fits

- You want product analytics without cookies: custom events, funnels and revenue on top of your traffic.
- You want a permanent free plan: 10,000 events a month for one project, 12 months of history, no card. Past that, new events pause until next month and nothing is charged.
- You want a predictable bill: paid plans are fixed monthly tiers, so a traffic spike inside your tier never changes it ([pricing](/#pricing)).
- You want analytics data stored in EU data centres in Germany, with a [DPA](/dpa) on every plan, free included.
- You track a website, a mobile app and a server in one place, with SDKs for each.

## FAQ

### Are cookieless visitor counts accurate?

With a [daily anonymous ID](/blog/what-is-cookieless-analytics), visitors per day are close to Google Analytics or a bit higher: people who would decline a banner still count. Over a week or a month, unique visitors read higher and returning visitors lower, as someone who returns on another day counts as new.

### Do ad blockers block cookieless tools?

Some do: EasyPrivacy, a common block list, includes Plausible, Fathom, Umami and Simple Analytics domains. Ad blockers block Privytics less often than Google Analytics, but some do; you can [route it through your own domain](/blog/ad-blockers-analytics-first-party-proxy) to recover the rest.

### What changes when I identify signed-in users?

Calling `identify()` links events to your own user IDs. That is personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first.
