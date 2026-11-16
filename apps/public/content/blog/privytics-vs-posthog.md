---
slug: privytics-vs-posthog
title: "Privytics vs PostHog: EU-Hosted Simplicity vs All-in-One Depth"
description: "A fair comparison of Privytics and PostHog: pricing models, EU hosting, cookies, session replay and self-hosting, plus when PostHog is clearly the better pick."
date: 2026-07-19
updated: 2026-07-29
tag: Comparison
---

PostHog does more than Privytics. That is the honest starting point. PostHog bundles product analytics, session replay, feature flags, experiments, surveys, error tracking, a data warehouse and more into one account and one bill, and its free tier is unusually generous. Privytics is narrower on purpose: product analytics with session replay, cookieless by default, event data stored in Germany, on flat stepped pricing you can predict before you sign up. If you want one vendor to replace five, PostHog is the stronger answer. If you want a small, predictable analytics tool with EU-only event storage and no cookies or device storage for anonymous tracking, Privytics is built for that.

## At a glance

| | Privytics | PostHog |
|---|---|---|
| Primary focus | Product and web analytics | All-in-one product OS (analytics, replay, flags, experiments, surveys, error tracking, warehouse) |
| Pricing model | Flat stepped tiers by monthly events, EUR, excluding VAT | Usage-based per product, USD, each product metered and billed separately |
| Free tier | 10,000 events/month, no card, 1 project | 1M analytics events, 5,000 web recordings, 2,500 mobile recordings, 1M flag requests/month, no card, 1 project |
| Entry paid price | EUR 10/month for 100k events | No fixed entry price. You pay per unit past the free allowances, from $0.00005/event |
| Fixed-price packages | None | Boost $250/month, Scale $750/month, Enterprise on request |
| Analytics event storage | Germany only | US (AWS N. Virginia) or EU (AWS Frankfurt), chosen at signup |
| Cookies by default | None. Nothing is written to the device | Cookies and localStorage by default. Cookieless is an opt-in configuration |
| Anonymous visitor id | Daily-rotating salted hash of IP, user agent and project id | Persistent identity via browser storage in the default configuration |
| Session replay | Yes, rrweb-based, opt-in per project, all text and inputs masked by default. Paid plans only | Yes, first-class, web and mobile, included in the free tier |
| Data retention | 12 months on free. 5 years of event history on paid. Replay recordings kept 30 days | Analytics data 1 year free, 7 years on paid. Session replay is retained separately: up to 30 days free, 90 days pay as you go, 1 year on Boost or Scale, 5 years on Enterprise |
| Per-seat charges | None | None |
| Licence | AGPL-3.0 (built on the OpenPanel engine) | MIT, except the `ee/` directory which has its own proprietary licence. A fully FOSS mirror exists |
| Self-hosting | Supported by running the open-source engine yourself | Possible but officially unsupported by the vendor |
| Billing | Polar as Merchant of Record, EU VAT handled | Direct, USD |

PostHog prices, allowances, retention periods and hosting regions above are as of July 2026, checked on 2026-07-29 against [posthog.com/pricing](https://posthog.com/pricing), [posthog.com/platform-packages](https://posthog.com/platform-packages) and PostHog's [session replay retention docs](https://posthog.com/docs/session-replay/data-retention). PostHog's pricing is usage-based and changes; check the live page before relying on any figure here.

## Pricing: stepped and flat versus metered per product

This is the clearest structural difference, and neither model is universally better.

Privytics charges a flat monthly price per event band, in euros and excluding VAT: EUR 10 for 100k events, EUR 20 for 500k, EUR 40 for 1M, EUR 100 for 5M and EUR 200 for 10M. Above 10M is custom. Every paid tier includes session replay and 5 years of event history. You know the number before you write a line of tracking code, and traffic spikes inside a band cost nothing extra.

PostHog charges for what you use, per product, with volume discounts. The unit rates below are as of July 2026, checked on 2026-07-29. Product analytics starts at $0.00005 per event in the 1M to 2M band, drops to $0.0000343 in the 2M to 15M band and reaches $0.0000090 per event at 250M+. Session replay starts at $0.005 per web recording and falls to $0.0015 at 500K+, with mobile recordings priced higher at entry. Feature flags, surveys, error tracking, data warehouse rows and logs each have their own unit and their own ladder. Every product has an individually settable billing limit, which is a genuinely good safeguard.

The trade-off is forecasting. With more than ten separately metered products, a PostHog bill is harder to predict than a stepped price, particularly with autocapture enabled, where event volume is a function of user behaviour rather than of instrumentation you chose. Some teams prefer paying exactly for usage. Others would rather see one number.

One more note on money: Privytics prices are in EUR excluding VAT and PostHog prices are in USD. Do not compare them without converting and adding your own tax treatment. Privytics bills through Polar as Merchant of Record, so Polar collects and remits EU VAT.

## Where the data lives

Privytics stores analytics event data in Germany, and there is no other region to choose. That is a constraint, not a feature toggle. If your requirement is that event data is stored in the EU, there is nothing to configure.

PostHog Cloud offers two regions, AWS eu-central-1 in Frankfurt and AWS us-east-1 in Northern Virginia, and region choice is available on every plan including free, at no extra cost. That is more flexible than most vendors, and the EU region is not gated behind an enterprise contract.

The caveat is that the two clouds are separate instances. You pick a region at signup and using both means separate accounts on `eu.posthog.com` and `us.posthog.com`. Moving an existing project between regions is not self-serve: PostHog's [migration docs](https://posthog.com/docs/migrate/migrate-to-cloud) describe a cross-region move as a migration the PostHog team runs for you after a support ticket, available only on the Scale or Enterprise package, rather than a setting you flip yourself (checked on 2026-07-29). Treat the region you pick at signup as effectively permanent.

## Cookies and consent

Privytics is [cookieless by default](/blog/what-is-cookieless-analytics). It sets no cookies and uses no device storage for anonymous analytics. The visitor identifier is a salted hash of IP address, user agent and project id, and the salt rotates at midnight UTC, so identifiers reset daily and cannot follow a person across days. Identified analytics happens only when you call `identify()` with your own user id and traits. Consent gating is built in: initialise with `disabled: true` and call `ready()` once the user consents.

PostHog is cookie-based by default. Its browser SDK uses cookies and localStorage to support cross-session identity and feature flag caching. Cookieless operation is available as an opt-in persistence configuration, and PostHog is clear about the cost: the docs treat it as a deliberate trade-off rather than banner-free tracking, and say plainly that whether you need a banner depends on the mode you pick. Turning off browser storage costs you capabilities that depend on persistent identity.

Neither tool makes you GDPR compliant. You remain the data controller, responsible for your lawful basis, your privacy notice and whether you need a consent banner. What differs is the default posture and how much configuration it takes to reach the posture you want. For how that maps to banner decisions in practice, see our guide on [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner). None of this is legal advice, and the answer depends on your jurisdiction, your regulator and how you configure the tool, so check with your own adviser.

## Analytics depth: PostHog is deeper

Privytics covers funnels, retention and cohorts, plus dashboards, profiles, custom events and a REST API, with [setup guides](/for) for script tag, JavaScript, React, [Next.js](/for/nextjs), Remix, Vue, Nuxt, Astro, Node, Express, React Native, iOS, Android, Python, Ruby, Rust and Java.

PostHog goes further. Trends, funnels, retention, user paths, stickiness, lifecycle, correlation analysis and group analytics for account-level B2B work are all first-class insight types. Behavioural cohorts feed directly into feature flags and experiments. Autocapture, event schema management, identity resolution, alerts and subscriptions are all there, and full SQL access over the underlying ClickHouse store means the UI is never a hard ceiling. In depth of product analytics, PostHog is in the Mixpanel and Amplitude class. Privytics is not trying to be. If those are the tools you are really weighing, the same trade-off is set out in our [Privytics and Mixpanel comparison](/blog/privytics-vs-mixpanel).

## Open source and self-hosting

Privytics is built on the open-source OpenPanel analytics engine, licensed AGPL-3.0. Privytics is an independent service and is not affiliated with, endorsed by or sponsored by OpenPanel. Our source is public at [github.com/sergiarguimbau/privytics](https://github.com/sergiarguimbau/privytics), so running the same engine yourself is always an option, and you can export your data at any time.

PostHog's main repository is MIT licensed, with the exception of the `ee/` directory which carries its own proprietary licence, and PostHog maintains a `posthog-foss` mirror with proprietary code removed. Self-hosting is a different story: PostHog's own [self-hosting docs](https://posthog.com/docs/self-host) call self-hosted deployments officially unsupported, with no guarantees, no product or infrastructure support, no published CVEs (fixes ship continuously from `master` to PostHog Cloud), and paid-plan features restricted to Cloud. The same page runs a decision flow: once you expect more than 300k events, 1k recordings or 300k `/flags` API calls a month it asks whether running infrastructure is a core competency for you, and it sends anyone under 1M events and 5k recordings a month to Cloud instead, on the grounds that the free tier already covers that volume (licence and self-hosting details checked on 2026-07-29). If a supported self-hosted deployment at scale is a hard requirement, neither vendor's cloud is the answer and you should evaluate the open-source engines directly.

## When PostHog is the better choice

- **You want one vendor for analytics, replay, flags, experiments, surveys and error tracking.** PostHog genuinely replaces several tools. Privytics does not have feature flags or experiments and is not planning to be that platform.
- **Your volume fits inside the free tier.** 1M analytics events, 5,000 web recordings and 1M flag requests per month, free, with no card, is far more generous than the 10,000 events on the Privytics free tier. For a side project or an early-stage product, that alone can decide it.
- **You need session replay without paying.** PostHog includes 5,000 web recordings a month on the free tier, kept for up to 30 days. On Privytics, replay is a paid-plan feature and is switched off on free. Either way, replay carries heavier consent questions than plain analytics, which we cover in [session replay and GDPR consent](/blog/gdpr-session-replay-consent).
- **You need deep product analytics.** Paths, stickiness, lifecycle, correlation analysis, group analytics and raw SQL over your event store are things Privytics does not offer.
- **You have a consent banner already and want full identity resolution.** If a banner is a given for you, PostHog's default cookie-based mode gives you more than a cookieless tool can.
- **You want a US region, or the option of either region.** Privytics stores event data in Germany only.
- **You need mobile session replay.** PostHog records iOS and Android sessions.

## When Privytics fits better

If your requirements are EU-only event storage, no cookies or device storage for anonymous analytics, a bill you can predict in advance, and a tool small enough to understand in an afternoon, Privytics is the tighter fit. It is also simpler to hand to a non-technical colleague, because there is much less product surface to learn.

Be aware of the trade-off in the other direction: Privytics is a newer service than PostHog, which has been operating for years and has a large, mature product. Weigh that honestly.

## FAQ

### Is PostHog cookieless?

Not by default. PostHog's browser SDK uses cookies and localStorage out of the box, and cookieless operation is an opt-in configuration with documented trade-offs. Privytics is cookieless by default and sets no cookies for anonymous analytics.

### Is PostHog free forever?

PostHog has a free plan with monthly allowances that reset, including 1M product analytics events and 5,000 web session recordings, with no credit card required (as of July 2026, checked on 2026-07-29). Past those allowances you pay per unit. Privytics has a free tier of 10,000 events per month, with no card.

### Does PostHog store data in the EU?

Yes, if you choose the EU region at signup. PostHog Cloud runs in AWS Frankfurt and AWS Northern Virginia, and region choice is available on every plan. The two clouds are separate instances, so pick carefully, because changing later is a migration. Privytics stores analytics event data in Germany only.

### Which is cheaper, Privytics or PostHog?

It depends entirely on volume and on which products you use. Below 1M events a month PostHog can be free where Privytics costs up to EUR 40. Above that, Privytics gives you a flat number per band while PostHog charges per unit per product. Compare against your own projected volume, and note that Privytics prices are EUR excluding VAT and PostHog's are USD.

### Can I self-host either one?

Both are open source, so technically yes. Privytics is built on the AGPL-3.0 OpenPanel engine and the Privytics source is public. PostHog's core is MIT with a proprietary `ee/` directory, but PostHog explicitly does not support self-hosted deployments and restricts paid features to its cloud.

## Try Privytics free

If EU event storage, cookieless defaults and predictable pricing describe what you need, the Privytics free tier gives you 10,000 events a month with no credit card, one project and 12 months of retention. If you read the list above and PostHog fits your requirements better, use PostHog.
