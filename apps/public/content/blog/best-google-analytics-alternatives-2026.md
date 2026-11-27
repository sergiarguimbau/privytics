---
slug: best-google-analytics-alternatives-2026
title: "Best Google Analytics alternatives (2026): 7 tools compared"
description: Plausible, Fathom, Simple Analytics, Umami, Matomo, PostHog and Privytics compared as Google Analytics alternatives: free plans, prices and cookies.
date: 2026-07-22
updated: 2026-11-27
tag: Comparison
---

For simple traffic stats, the best Google Analytics alternatives are Plausible, Fathom and Simple Analytics. If you also want to follow what people do after they land, look at Umami, Matomo, PostHog or Privytics.

Privytics is our product, so we list it last.

## Which kind of tool do you need?

GA4 does two jobs at once, which is why it feels heavy.

- **Web analytics** answers "how many visitors, from where, on which pages?" Plausible, Fathom and Simple Analytics focus on this.
- **Product analytics** answers "what do people do next, and do they come back?" Umami, Matomo, PostHog and Privytics add it on top of traffic stats.

If you only used GA's traffic overview, web analytics is enough. If you built funnels or cohort reports, you need product analytics. More in [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics).

## At a glance

|                  | Free plan        | Cookies | Data stored in | Retention, cohorts |
|------------------|------------------|---------|----------------|--------------------|
| Plausible        | ✗ (30-day trial) | None    | Germany        | ✗                  |
| Fathom           | ✗ (7-day trial)  | None    | US ¹           | ✗                  |
| Simple Analytics | ✓ (badge)        | None    | EU (mainly NL) | ✗                  |
| Umami Cloud      | 100k events/mo   | None    | US or EU       | ✓ ²                |
| Matomo Cloud     | ✗ (21-day trial) | Yes ³   | Germany        | Cohorts ✓          |
| PostHog          | 1M events/mo     | Yes ⁴   | US or EU       | ✓                  |
| Privytics        | 10k events/mo    | None    | Germany        | ✓ ⁵                |

¹ EU visitors' IP addresses are removed on EU servers; the anonymised data is stored in the US. ² Umami links logged-in users with `umami.identify()`. ³ Three cookies by default; cookieless is an opt-in setting. ⁴ Cookieless mode is opt-in. ⁵ For signed-in users you identify.

Free plans compared in detail: [free analytics with no credit card](/blog/free-analytics-no-credit-card).

## What they cost

Monthly list price at two traffic levels:

|                  | 100k  | 1M    |
|------------------|-------|-------|
| Plausible        | $19 ¹ | $69 ¹ |
| Fathom           | $15   | $60   |
| Simple Analytics | €20   | €60   |
| Umami Cloud      | Free  | $20   |
| Matomo Cloud     | €38   | €172  |
| PostHog          | Free  | Free  |
| Privytics        | €10   | €40   |

¹ Starter plan; funnels need Business ($39 and $139). Simple Analytics counts page views and Matomo counts hits; the others count page views and events. Prices excl. VAT.

## Plausible: the simplest traffic dashboard

Plausible gives you one clean dashboard that anyone on the team can read. It starts at $9/mo for 10k page views and events, and funnels need the Business plan. A free open-source edition lets you host it yourself, without funnels.

Compare: [Privytics vs Plausible](/blog/privytics-vs-plausible).

## Fathom: many sites on one plan

Fathom is close to Plausible: cookieless and simple. Every plan includes at least 50 sites and revenue tracking, but there are no funnels, retention or cohorts.

Compare: [Plausible vs Fathom](/blog/plausible-vs-fathom) and [Privytics vs Fathom](/blog/privytics-vs-fathom).

## Simple Analytics: free with a badge

The free plan covers up to 5 sites with unlimited page views under fair use, in exchange for a badge on your site. It keeps 30 days of history. Funnels are built from goals, which are paid-only, and there are no retention or cohort reports.

Compare: [Privytics vs Simple Analytics](/blog/privytics-vs-simple-analytics).

## Umami: open source with a big free plan

Umami Cloud's free plan includes 100k events a month for one website, with 6 months of history. Funnels, retention and user journeys are on every plan, and self-hosting is free (MIT licence). Each saved event property counts as one more event, which uses up the allowance faster.

Compare: [Privytics vs Umami](/blog/privytics-vs-umami).

## Matomo: the most GA-like

Matomo has the feature set closest to GA, including ecommerce, SEO and site-search reports. Matomo Cloud starts at €22/mo for 50k hits. Self-hosting is free, but funnels and cohorts are paid plugins there.

Compare: [Privytics vs Matomo](/blog/privytics-vs-matomo).

## PostHog: analytics plus product tools

PostHog is an all-in-one suite with product analytics, feature flags, experiments and surveys, among other tools. It suits teams that want all of that in one place. Past the free 1M events you pay per event, and events from identified users cost extra.

Compare: [Privytics vs PostHog](/blog/privytics-vs-posthog).

## Privytics: cookieless product analytics

Privytics combines a traffic dashboard with product analytics. For anonymous visitors you get traffic, referrers, UTM campaigns, custom events, goals, revenue and funnels within one visit. Retention across days, cohorts, user profiles and cross-visit funnels work for signed-in users you identify.

Each visitor gets an anonymous ID that changes every day; nothing is stored on the device. Analytics data is stored in EU data centres in Germany.

Free plan: 10,000 events a month for one project, with 12 months of history, no credit card and no time limit. On the free plan, new events pause until next month and nothing is charged. Paid plans add 5 years of history, more projects, data imports and the AI assistant.

Privytics runs on OpenPanel, an open-source analytics engine (AGPL-3.0). You can export all your data, so you can self-host the engine or move to OpenPanel's own cloud at any time. Privytics is an independent service and is not affiliated with, endorsed by, or sponsored by OpenPanel.

Another tool fits better if you need:

- A larger free plan: Umami or PostHog.
- Feature flags or A/B tests: PostHog.
- An ISO 27001 certified vendor: Matomo.

## FAQ

### Do these tools need a cookie banner?

Often not: Plausible, Fathom, Simple Analytics, Umami and Privytics set no cookies, so anonymous analytics generally needs no [cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner). Matomo and PostHog set cookies by default, so they usually need one unless you turn on their cookieless option.

### Can I bring my Google Analytics history with me?

Plausible and Matomo can import it; Privytics cannot, so your history stays in GA. Run the new tool next to GA for a few weeks, as our [GA4 migration guide](/blog/migrate-from-google-analytics-ga4-cookieless) explains.

### Is Google Analytics legal in the EU?

Yes, with two conditions: cookie consent before it runs, and US transfers covered by the EU-US Data Privacy Framework (DPF). The DPF is valid today, but it is under legal challenge: see [is Google Analytics legal in the EU](/blog/is-google-analytics-legal-eu-2026).
