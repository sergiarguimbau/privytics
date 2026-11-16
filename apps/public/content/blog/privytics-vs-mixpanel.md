---
slug: privytics-vs-mixpanel
title: "Privytics vs Mixpanel: Pricing, Cookies and EU Data Residency"
description: Privytics vs Mixpanel compared on price at volume, cookieless tracking, EU data residency and analytical depth, including the cases where Mixpanel wins.
date: 2026-07-19
updated: 2026-11-16
tag: Comparison
---

Mixpanel is the deeper product analytics tool. If you need behavioural cohorts, Flows, experiment reporting and a hundred integrations, it beats us on capability and it is not close. Privytics is the better fit when you want anonymous analytics that sets no cookies and no device storage, event data stored in Germany by default, and flat monthly pricing that does not accelerate as your event volume grows. Below roughly 1 million events per month, Mixpanel is also cheaper than us, because its free plan is large. Above that threshold, the pricing curves diverge sharply.

## The short version

Privytics is a managed, EU-hosted analytics service built on the open-source OpenPanel engine (AGPL-3.0). We are an independent service and are not affiliated with, endorsed by or sponsored by OpenPanel. This post compares design decisions and published prices, and we make no claims about being faster or more accurate than Mixpanel.

Mixpanel is a mature, closed-source SaaS product analytics platform. Its data model is events, users and cohorts, and its reporting suite is the benchmark most of the category is measured against.

## Comparison table

| Attribute | Privytics | Mixpanel |
|---|---|---|
| Free tier | 10,000 events/month, no card, 1 project | $0, up to 1M events/month, no card required |
| Paid entry price | EUR 10/month for 100k events | No fixed entry price. Usage-based: first 1M events/month free, then $0.28 per 1,000 events |
| Pricing model | Flat monthly tier by event volume | Per-event usage billing, charged by ingestion time |
| Cost at 5M events/month | EUR 100/month | Approx. $1,120/month at list rate (computed, before volume discounts) |
| Cost at 10M events/month | EUR 200/month | Approx. $2,520/month at list rate (computed, before volume discounts) |
| Cookies by default | None. No cookies, no device storage for anonymous analytics | Yes. JS SDK defaults to `persistence: 'cookie'` with 365-day expiry |
| Storage-based consent trigger | None set for anonymous analytics, so the storage trigger does not apply. Your own legal assessment still applies | Expect a banner in a standard client-side web install |
| Analytics data location | Germany (EU). No region to choose | US by default. EU and India residency available, chosen at project creation |
| Session replay | Paid plans only, rrweb-based, masks all text and inputs by default | Included: 10,000 replays/month Free, 20,000/month Growth. 30-day default retention |
| Analytical depth | Funnels, retention, cohorts, dashboards, profiles, custom events | Deeper: Insights, Funnels, Flows, Retention, behavioural cohorts, Signal, Experiments, Impact |
| Open source | Yes, engine is AGPL-3.0 and public | No. Platform is proprietary. Client SDKs only (mixpanel-js is Apache-2.0) |
| Self-hosting | Yes, the engine is AGPL so you can run it yourself | No on-premise or private-cloud option |
| Event data retention | 12 months free, 5 years paid | 2 years by default. Projects created before 1 September 2025 keep 5 years, dropping to 2 if the plan changes or moves to Free |
| Billing | Polar as Merchant of Record, EU VAT collected and remitted | Direct, usage-based |

Mixpanel prices, plan limits and retention periods are as of July 2026, re-checked on 2026-07-29 at [mixpanel.com/pricing](https://mixpanel.com/pricing/), [docs.mixpanel.com/docs/pricing](https://docs.mixpanel.com/docs/pricing/) and [docs.mixpanel.com/docs/privacy/gdpr-compliance](https://docs.mixpanel.com/docs/privacy/gdpr-compliance). Privytics prices are in EUR excluding VAT; Mixpanel prices are shown in USD on its pricing page. We are not converting between them, so compare with your own exchange rate in mind.

## Cost at volume

Mixpanel's free allowance is the most generous headline number in this comparison. One million events per month at $0, with unlimited seats and no credit card, is far more raw volume than our free tier gives you. If your product generates under 1M events per month and you are happy with the Free plan's constraints, Mixpanel costs you nothing and we cannot beat that on price.

Check the constraints before you plan around that allowance. Mixpanel's Free plan is capped at 5 saved reports per seat, and behavioural cohorts and custom properties are marked "Limited" rather than unlimited. Both become unlimited on Growth. Free gets project-level roles and permissions; report-level permissions arrive on Growth and compartmentalised data access on Enterprise. If unrestricted cohort analysis is the reason you want Mixpanel, price the paid plan rather than the free one.

Past 1M events, Growth bills at $0.28 per 1,000 events as of July 2026. That is a published, transparent rate, which is more than many analytics vendors disclose. It is also linear in a way that flat tiers are not. At list rate before volume discounts, 5M events per month works out to roughly $1,120 and 10M to roughly $2,520. Those figures are our own arithmetic from the published unit rate, not numbers Mixpanel quotes. The pricing page lists Growth as covering up to 20M events per month and describes Enterprise volume as unlimited, and says volume discounts are available, but the discount curve is not published, so your real bill above a few million events requires a conversation.

Our equivalent tiers are EUR 100 at 5M and EUR 200 at 10M. The structural difference is that our price is set by the tier you sit in, while Mixpanel's is set by how chatty your instrumentation is. Two things compound that on the Mixpanel side. First, add-ons apply percentage multipliers to overage: Mixpanel's billing docs state Group Analytics adds 40% and Data Pipelines adds 20% on the additional data ingested, and Group Analytics is close to mandatory if you sell [B2B SaaS](/for/saas) and need account-level analysis. Second, billing runs on ingestion time rather than event time, so a backfill or a delayed batch upload lands in the month Mixpanel processes it.

To be fair to Mixpanel, some system events are excluded from the count, including `$identify`, `$create_alias`, `$merge`, `$opt_in`, `$mp_session_record` and profile creates and updates. There is also a Startup Plan giving the first year free to companies founded less than five years ago with up to $8M in total funding that have not redeemed another offer.

## Cookies and consent

This is the clearest design difference between the two products.

Privytics is cookieless by default. We set no cookies and use no device storage for anonymous analytics. The anonymous visitor id is a daily-rotating salted hash of IP address, user agent and project id, and the salt rotates at midnight UTC, so ids reset every day and cannot follow a person across days. That is the standard [cookieless analytics](/blog/what-is-cookieless-analytics) design rather than anything unusual to us. Identified analytics only happen when you call `identify()` with your own user id and traits. If you do want to gate everything behind consent anyway, you can initialise with `disabled: true` and call `ready()` after the user accepts.

Mixpanel does not position itself as consent-free and does not claim you can skip a banner. Its own blog states that its SDKs are legally cookies under EU law and that EU law permits cookies where the visitor gives valid, verifiable consent. The documented `mixpanel-js` defaults are `persistence: 'cookie'`, `cookie_expiration: 365`, `cross_subdomain_cookie: true` and `disable_persistence: false`. These are first-party cookies, not third-party ones. Mixpanel provides `opt_in`/`opt_out` APIs and an `opt_out_tracking_by_default` flag, and its docs note that the client-side opt-out call does not affect server-side events.

You can push Mixpanel towards cookieless, but it is a set of trade-offs rather than a switch. Setting `persistence: 'localStorage'` is still browser storage and still typically consent-relevant in the EU. Setting `disable_persistence: true` costs you super properties and anonymous-to-identified stitching. Genuinely cookieless Mixpanel means moving to server-side tracking.

Neither tool makes you compliant. Mixpanel's docs are explicit that Mixpanel is the processor and the customer is the controller, and the same is true of us. We can describe our design, keep analytics event data in Germany and offer a [DPA](/dpa). You remain the data controller, and whether you need a banner depends on your full site, your other tooling and your own legal assessment. We go through where the storage trigger does and does not apply in [cookieless analytics and the GDPR cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner). This post is not legal advice.

## EU data residency

Our analytics event data is stored in Germany. There is no region to choose and nothing to configure.

Mixpanel stores data on US servers on Google Cloud by default, with EU and India residency available as alternatives. There are three real operational catches, all documented by Mixpanel. First, residency must be selected when the project is created and cannot be retrofitted onto an existing project. Second, EU and India projects use separate endpoints (`api-eu.mixpanel.com` and `api-in.mixpanel.com` for ingestion), and for EU projects created after 18 August 2025 no data is ingested at all unless your SDK points at the regional endpoint. Third, the US-to-EU forwarding path that older projects relied on has been retired. [Mixpanel's changelog](https://docs.mixpanel.com/changelogs#deprecation-notice-legacy-us-to-eu-data-forwarding-ends-july-2026-for-eu-projects) states that the legacy automated forwarding for EU projects created before 18 August 2025 ended on 1 July 2026. Events forwarded between 1 July and 1 August 2026 were kept but temporarily hidden from the UI and the Query API, and events still sent to US endpoints for EU projects after 1 August 2026 are not accepted. Projects that Mixpanel notified directly have an extended timeline to February 2027. If you inherited an older EU project, check which endpoint your SDK actually posts to rather than assuming.

Our sub-processors, including US-based ones for billing, email, monitoring and AI features, are listed in Section 7 of our [privacy policy](/privacy).

## Analytical depth, where Mixpanel wins

Mixpanel's reporting is its core competence and we are not going to pretend otherwise. Insights, Funnels, Flows and Retention are available on every plan including Free, and Flows in particular has no equivalent on our side: open-ended sequence analysis showing how users actually move through a product is hard to build and Mixpanel has had years to refine it. Signal correlation analysis and Impact with statistical significance are listed on Growth as well as Enterprise. Experiments is an add-on on Growth and included as experiment reporting on Enterprise, and Enterprise is where sensitive-data classification and compartmentalised data access live. Growth also brings unlimited behavioural cohorts and custom properties, lookup tables, data warehouse connectors, and data pipelines as an add-on. The integration directory is extensive and includes Segment and mParticle. If Mixpanel is on your shortlist then Amplitude usually is too, and we compare that one on the same terms in [Privytics vs Amplitude](/blog/privytics-vs-amplitude).

We ship [funnels, retention and cohorts](/blog/funnels-retention-cohorts-without-cookies) alongside dashboards, profiles, custom events and a REST API, with [setup guides](/for) for script tag, JavaScript, React, Next.js, Remix, Vue, Nuxt, Astro, Node, Express, React Native, iOS, Android, Python, Ruby, Rust and Java. That covers the [product analytics](/blog/product-analytics-vs-web-analytics) questions most teams ask week to week, rather than the pageview reporting most web analytics tools stop at. It does not match Mixpanel's ceiling.

Session replay is a similar story on availability. Mixpanel includes it at baseline volumes across web, iOS, Android, React Native and Electron, with 10,000 replays per month on Free and 20,000 on Growth, a 30-day default retention, and customisable retention between 7 and 360 days for Enterprise add-on customers. Worth knowing: customers on complimentary replays cannot view replays once they hit the allowance unless they upgrade, and Mixpanel reserves the right to stop ingesting replays beyond the allocated amount. Our replay is rrweb-based, opt-in per project, masks all text and inputs by default, and is on paid plans only. It is off entirely on our free tier.

## When Mixpanel is the better choice

Pick Mixpanel if any of these describe you.

- **You are under 1M events per month and want maximum capability for zero cost.** The free plan plus unlimited seats is hard to argue with, especially combined with the Startup Plan's free first year if you qualify.
- **Behavioural cohorts and Flows are central to how you work.** If you have a growth or data person who lives in cohort analysis and open-ended path exploration, that is Mixpanel's home turf.
- **You need experimentation and impact analysis in the same tool.** Signal, Experiments and Impact have no equivalent here.
- **You need deep CDP or warehouse integration.** Segment, mParticle, warehouse connectors and 100+ integrations are a real moat.
- **You have already accepted a consent banner.** If a banner is a settled cost of doing business for you, our cookieless design buys you less, and Mixpanel's depth is worth more.
- **You need mobile session replay.** Mixpanel covers iOS, Android, React Native and Electron for replay at baseline volumes.
- **You want a vendor with years of production history behind it.** Privytics is a newer service than Mixpanel, which has been operating for years. That is a legitimate reason to choose someone else.

## FAQ

### Is Mixpanel cookieless?

No. The JavaScript SDK defaults to first-party cookies with a 365-day expiry. You can switch to localStorage or disable persistence, but both are trade-offs rather than a true cookieless mode, and disabling persistence costs you super properties and anonymous-to-identified stitching.

### Do I need a cookie banner with Mixpanel?

In a standard client-side web deployment, expect to. Mixpanel's own blog states its SDKs are cookies under EU law requiring valid consent, and its docs place responsibility for compliance on the implementing company.

### How much does Mixpanel cost at 5 million events per month?

Roughly $1,120 per month at the published Growth list rate of $0.28 per 1,000 events after the first 1M free, as of July 2026 (checked 2026-07-29 on [mixpanel.com/pricing](https://mixpanel.com/pricing/)). That is our arithmetic, not a Mixpanel quote, and volume discounts apply at higher tiers but are not published.

### Can I self-host Mixpanel?

No. Mixpanel is cloud SaaS only, with US, EU or India residency as the data-location controls. Only its client SDKs are open source (mixpanel-js is Apache-2.0). Privytics runs on the AGPL-3.0 OpenPanel engine, so self-hosting the same engine is always available to you.

### Where does Privytics store my analytics data?

In EU data centres in Germany. There is no region selection step and no endpoint to configure.

## Trying Privytics

If you are over 1M events a month and watching a Mixpanel bill accelerate, or you want anonymous analytics that sets no cookies and keeps event data in Germany, we are worth an evaluation. The free tier is 10,000 events per month, no credit card, 1 project, and 12 months of data retention. If you are still drawing up a shortlist rather than choosing between two tools, our wider survey of [Mixpanel alternatives](/blog/mixpanel-alternatives-2026) covers the rest of the category. If Mixpanel's depth is what your team actually needs, stay on Mixpanel. It is a good product, and our source is AGPL, so running the same engine yourself is always an option too.
