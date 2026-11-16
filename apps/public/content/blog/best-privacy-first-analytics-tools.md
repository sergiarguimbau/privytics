---
slug: best-privacy-first-analytics-tools
title: "Best Privacy-First Analytics Tools in 2026: An Honest Roundup"
description: Best privacy-first analytics tools compared: Plausible, Fathom, Umami, Matomo, PostHog, OpenPanel and Privytics, on cookieless defaults, EU hosting and price.
date: 2026-07-19
updated: 2026-07-29
tag: Comparison
---

If you want simple, cookieless web analytics with a mature track record, pick **Plausible** or **Fathom**. If you want a genuinely free hosted tier or a permissive open source licence you can self-host without conditions, pick **Umami**. If you need a full Google Analytics replacement with EU hosting and every marketing report, pick **Matomo**. If you need deep product analytics plus feature flags and experiments and can live with a consent banner, pick **PostHog**. If you want product analytics depth at a low price with an AGPL escape hatch, look at **OpenPanel**, or at **Privytics**, the managed EU service we run on the open source OpenPanel engine.

Below is the comparison table, then an honest read on each tool, including where ours is the wrong answer. Every competitor figure here was re-checked in July 2026 against the vendor's own pricing or documentation page, and each section links the page we read. Some vendors price through a slider, localise currency, or render their plan table in the browser, so treat the figures below as a snapshot rather than a quote, and where we could not read a number off the vendor's own page we say so instead of guessing. The comparison rests on published facts rather than head-to-head testing, and nothing here claims we are faster or more reliable than anyone.

## Comparison table

| Tool | Hosting region | Cookieless | Free tier | Open source | Session replay | Product analytics depth | Entry price |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Plausible | EU only, EU-owned infrastructure | Yes, by default | No, 30-day trial | AGPLv3 core, MIT tracker | No, not built | Marketing funnels only | From USD 9/mo at 10k pageviews |
| Fathom | EU visitor data isolated in the EU, rest on US infra | Yes, by default | No, 7-day trial | No, current product closed | No | Minimal, events and goals | From USD 15/mo |
| Umami | Cloud servers in US and EU, no documented region choice | Yes, by default | Yes, free Hobby plan | MIT, fully permissive | Yes, documented feature, 30-day storage | Moderate | USD 0, then paid Cloud tiers |
| Matomo | EU (Frankfurt) on cloud, anywhere self-hosted | No, cookies by default | No cloud free tier, self-host free | GPL v3 core, premium plugins proprietary | Yes, metered separately | Moderate, session-centric | From USD 26/mo at 50k hits |
| PostHog | US (Virginia) or EU (Frankfurt) | No, opt-in cookieless mode | Yes, 1M events/mo | MIT core, `ee/` proprietary | Yes, 5k web replays free | Deep | USD 0, then usage-based |
| OpenPanel | EU (Frankfurt) | Yes, by default | No, 30-day trial | AGPL-3.0 server, MIT SDKs | Yes, included | Mid | USD 2.50/mo at 5k events |
| Privytics | EU (Germany) | Yes, by default | Yes, 10k events/mo | Engine is AGPL-3.0, source public | Yes, paid plans, opt-in per project | Mid | EUR 0, then EUR 10/mo at 100k events |

## Plausible: the best simple cookieless web analytics

Plausible is the most focused tool here and the one with the clearest privacy story. Its data policy states that all visitor data is processed and stored in the EU on infrastructure owned by European companies, and that the legal entity is incorporated in Estonia, so it is EU-owned rather than merely EU-hosted. The visitor identifier is a hash of a daily salt plus the site domain plus IP plus user agent, and raw IPs are never stored, which is the same [cookieless analytics](/blog/what-is-cookieless-analytics) pattern most tools in this roundup use.

It is also honest about its boundaries. Plausible publishes a page on [when not to use Plausible](https://plausible.io/when-not-to-use-plausible), naming cohort analysis, retention curves, user-level behaviour and experimentation as reasons to use a [product analytics tool](/blog/product-analytics-vs-web-analytics) instead. Session replay does not exist: the same page states that Plausible does not record individual visitor sessions, and that there are no mouse movement recordings, rage click detection or heatmaps.

Pricing starts at USD 9/month on Starter at 10,000 monthly pageviews, with Growth at USD 14 and Business at USD 19 at the same volume, as of July 2026. There is no free plan, only a 30-day trial with no card. Checked on the [Plausible pricing page](https://plausible.io/#pricing), which showed those figures in US dollars.

## Fathom: the simplest hosted option with EU isolation on every plan

Fathom is a Canadian company, Conva Ventures Inc. in British Columbia, selling one thing well. Its [EU Isolation](https://usefathom.com/features/eu-isolation) feature routes EU visitor traffic through EU servers and strips the IP inside the EU before anything reaches its US infrastructure. Fathom states that this is enabled by default and that you get full coverage on either plan tier, with no setup required.

The trade-off is scope. There are no funnels, cohorts, retention analysis, user-level views or session replay. It does have custom events, goals and ecommerce revenue tracking. Every paid tier includes all features, so you buy volume rather than feature unlocks, and sites are bundled rather than billed one by one: the pricing page showed 50 sites included, with packs of 50 more sold on top at USD 10/month.

Pricing starts at USD 15/month as of July 2026, and the pricing slider showed USD 45/month at 500,000 pageviews when we checked. There is no free tier, which the vendor describes as a deliberate consequence of the infrastructure it has built, and you get a 7-day trial instead. Checked on the [Fathom pricing page](https://usefathom.com/pricing). If Plausible and Fathom are your two finalists, we set them against each other in [Plausible vs Fathom](/blog/plausible-vs-fathom).

## Umami: the best free and the most permissive licence

Umami pairs a free hosted tier with an MIT licence and no open-core carve-out, and self-hosting is unrestricted on volume.

Umami's own docs describe the Hobby plan as free, and aimed at personal projects and low traffic websites, with a Pro tier above it and a 14-day trial on paid subscriptions. Umami also ships funnels, retention and user journeys rather than stopping at pageviews and sources, and its docs cover session replay and heatmaps as product features, with replays stored for 30 days. One caveat on the numbers: Umami's pricing page renders its plan table in the browser, so we could not read the current event allowance, site count, retention window or paid price off the page itself, and Umami has moved its plan limits before. Check the [Umami pricing page](https://umami.is/pricing) yourself before you commit.

One gap for strict buyers: Umami's cloud FAQ states its servers are located in the US and the EU, and documents no customer-selectable or guaranteed EU-only region. If you need residency written into a contract, self-host or pick a tool that commits to one region.

## Matomo: the best full Google Analytics replacement

If your requirement is "everything GA4 does, but in Europe and owned by us", Matomo has been the answer for over a decade. Cloud data is stored in Frankfurt, Germany. The core and the JavaScript tracker are GPL v3, and the self-hosted On-Premise edition is free forever with unlimited hits and users.

Two things to know. First, Matomo is not cookieless by default; the standard tracking code sets first-party cookies, and Matomo documents the defaults as `_pk_id` at 13 months, `_pk_ses` at 30 minutes and `_pk_ref` at 6 months, all adjustable in the tracking code. Cookieless mode is an opt-in configuration that costs you returning-visitor accuracy. Second, Matomo is unusually careful about consent claims, giving jurisdiction-by-jurisdiction guidance rather than a blanket "no banner needed".

Cloud is billed by hits, where a hit is any tracked action rather than just a pageview, so event-heavy sites burn through allowances faster than expected. Matomo's own pricing summary listed USD 26/month at 50,000 hits, USD 42 at 100,000 and USD 204 at 1 million as of July 2026, excluding tax. The page prices by plan tier and localises currency, so read your own figure off the selector. Premium features such as Funnels, Cohorts and A/B Testing are bundled into the higher cloud tiers rather than sold as add-ons; on self-hosted they are proprietary paid plugins. Heatmaps and session recordings are metered separately from your hit allowance. Checked on the [Matomo pricing page](https://matomo.org/pricing/).

## PostHog: the deepest product analytics, if you accept a banner

PostHog has the most product analytics depth here: trends, funnels, retention, paths, stickiness, lifecycle and group analytics, plus session replay, feature flags, experiments, surveys, error tracking and SQL access over the underlying ClickHouse store. The free tier is generous at 1 million events, 5,000 web recordings and 2,500 mobile recordings per month, with no per-seat charges. You can choose a US (Virginia) or EU (Frankfurt) region on every plan including free.

It is cookie-based by default. Cookieless is an opt-in persistence mode, and PostHog's own [cookieless tracking guide](https://posthog.com/tutorials/cookieless-tracking) documents the cost honestly: you cannot call `identify()`, session replay and surveys are disabled without consent, and GeoIP enrichment and bot detection stop working because the IP is stripped before those run. Self-hosting is officially unsupported and its docs point you to cloud above roughly 300,000 events a month, and usage-based pricing across many separately metered products takes work to forecast. Free-tier allowances checked in July 2026 on the [PostHog pricing page](https://posthog.com/pricing).

## OpenPanel: product analytics depth at web analytics prices

OpenPanel sits deliberately between Plausible and Mixpanel: cookieless by default, EU cloud in Frankfurt, funnels, cohorts, retention, user profiles and session replay, starting at USD 2.50/month for 5,000 events and USD 20/month for 100,000, as of July 2026. The server is AGPL-3.0 and the client SDKs are MIT, so embedding an SDK carries no copyleft obligation, and self-hosting via Docker Compose is a first-class path with no event cap. There is no free tier, only a 30-day trial without a card. Checked on the [OpenPanel pricing page](https://openpanel.dev/pricing).

The vendor is candid about its ceiling: Mixpanel has more advanced multi-path funnels and a better cohort builder, there are no native feature flags, and warehouse integration is limited.

## Where Privytics fits

Privytics is a managed service built on the open source OpenPanel engine. We are not affiliated with, endorsed by or sponsored by OpenPanel; our own source is public at [github.com/sergiarguimbau/privytics](https://github.com/sergiarguimbau/privytics). Analytics event data is stored in Germany, and the service is operated from Spain.

What is different is the packaging: a permanent free tier of 10,000 events per month with no card, one project and 12 months of retention, then EUR 10/month for 100,000 events, EUR 20 for 500,000, EUR 40 for 1 million, EUR 100 for 5 million and EUR 200 for 10 million, excluding VAT, with custom pricing above that. Tiers are stepped rather than usage-metered, so the bill is the same number every month until you cross a threshold. Paid plans add session replay and 5 years of event history. Billing runs through Polar as merchant of record, which collects and remits EU VAT.

On the tracking side, nothing is written to the visitor's device: the anonymous visitor id is a daily-rotating salted hash of IP, user agent and project id, so ids reset at midnight UTC and cannot follow a person across days. Named users appear only when you call `identify()` yourself, and session replay is opt-in per project with all text and inputs masked by default. There is more detail on [how funnels, retention and cohorts work without cookies](/blog/funnels-retention-cohorts-without-cookies).

The honest caveats: Privytics is a newer service than Plausible or Matomo, which have been operating for years. The free tier comes with community support and no SLA. Our product analytics depth is mid-tier, not Mixpanel or PostHog depth. Cookieless design and EU hosting do not make you GDPR compliant on their own; you remain the data controller, a [DPA](/dpa) is available, and your compliance assessment is yours to make. None of this is legal advice.

## When another tool is the better choice

- **Plausible**, if you only need traffic, sources, content and goals, and you value a years-long operating record and EU ownership over feature breadth.
- **Fathom**, if you want the least possible configuration, run many sites, and want EU isolation on by default without thinking about it.
- **Umami**, if you want a free hosted plan on a permissive MIT licence, or unrestricted self-hosting with no event cap and no open-core carve-out.
- **Matomo**, if you need GA4-equivalent marketing reporting, log file import, tag management or a mature ecommerce module, or your procurement process wants a long-established vendor.
- **PostHog**, if you need feature flags, experiments, error tracking or SQL access, or behavioural depth matters more than running without a consent banner.
- **OpenPanel**, if you want the same engine at a lower entry price for small volumes, would rather buy from the upstream project directly, or want to self-host it yourself with no event cap.
- **Google Analytics, Mixpanel or Amplitude**, if you need deep ad platform integration or enterprise product analytics and a consent banner is already part of your setup. None are cookieless by default.

## FAQ

### What is the best free privacy-friendly analytics tool?

Umami's free Hobby plan is the most generous cookieless hosted option in this roundup, though its current event allowance is only shown on Umami's own pricing page, which renders in the browser, so check the figure there. PostHog's free tier is larger at 1 million events a month but is not cookieless by default. Privytics offers 10,000 events a month free with no card.

### Do cookieless analytics tools still need a cookie banner?

Most vendors in this category say no, on the basis that they set no cookies and store no personal data. That is a vendor legal position, not a regulator ruling, and the obligation sits with you as the site operator. Matomo is the most cautious voice here and gives jurisdiction-specific guidance worth reading. We work through the reasoning in [cookieless analytics and the GDPR cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner). Nothing in this post is legal advice.

### Which analytics tools store data in the EU?

Plausible (EU-owned infrastructure), Matomo Cloud (Frankfurt), OpenPanel (Frankfurt) and Privytics (Germany) store data in the EU by default. PostHog offers an EU region in Frankfurt as a choice at signup. Fathom isolates EU visitor data in the EU while other traffic goes to US infrastructure. Umami states servers in the US and the EU but does not document a guaranteed EU-only region.

### Can I get funnels and retention without paying Mixpanel prices?

Yes. Umami, OpenPanel, PostHog and Privytics all include funnels and retention analysis at a fraction of enterprise product analytics pricing. Plausible has marketing funnels on its higher tiers but no retention curves or cohorts, and Fathom has neither.

### Which of these can I self-host?

Plausible (AGPLv3 Community Edition, which excludes marketing funnels, user journeys, ecommerce revenue goals, SSO and the sites API), Umami (MIT, unrestricted), Matomo (GPL v3, free and unlimited), OpenPanel (AGPL-3.0) and the OpenPanel engine behind Privytics. PostHog is technically self-hostable but officially unsupported. Fathom's current product and Google Analytics are not self-hostable.

## Trying Privytics

If a managed EU-hosted product analytics tool with funnels, retention and cohorts is the right shape, our free tier is 10,000 events a month, with no credit card. If one of the other tools above fits you better, use it. Several of them have been doing this far longer than we have.
