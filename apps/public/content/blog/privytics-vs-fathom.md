---
slug: privytics-vs-fathom
title: "Privytics vs Fathom Analytics: Pricing, Privacy and Features"
description: Privytics vs Fathom Analytics compared on price, EU hosting, cookieless tracking, funnels and session replay. Fathom has no free tier; Privytics does.
date: 2026-07-19
updated: 2026-07-29
tag: Comparison
---

Fathom Analytics and Privytics are both cookieless, privacy-first analytics services, but they are aimed at different jobs. Fathom is web analytics: it answers where your traffic comes from and which pages perform, in a single simple dashboard, with no free tier and a starting price of $15 per month as of July 2026. Privytics is product analytics built on the open-source OpenPanel engine: funnels, retention, cohorts, profiles and custom events, with a free tier of 10,000 events per month and analytics data stored in Germany. If you run a marketing site or a blog and want traffic reporting without a cookie banner, Fathom is the more established choice. If you need to see how users move through your product over multiple steps, Fathom does not do that, by design.

## The short version

Fathom is a mature, independently owned Canadian product (Conva Ventures) with years of operating history, real email support at every tier and a deliberately narrow feature set. Its homepage headline is "A Google Analytics alternative that's simple & privacy-first", and that is an accurate description of the scope.

Privytics is a newer service than Fathom. What it offers is a free tier that does not expire, EU-only storage for analytics event data, and the product analytics primitives that Fathom does not ship.

## Feature and pricing comparison

| Attribute | Privytics | Fathom Analytics |
| --- | --- | --- |
| Free tier | 10,000 events/month, no card, 1 project | None. 7-day free trial, credit card required at sign-up |
| Entry paid price | EUR 10/month for 100k events | $15/month (USD) for 100k pageviews, 50 sites |
| Mid tier | EUR 40/month for 1M events | $60/month for 1M pageviews |
| High tier | EUR 200/month for 10M events | $200/month for 10M pageviews |
| Above that | Custom above 10M | $470/month at 25M, then contact sales |
| Annual discount | Not offered | 2 months free, roughly 17% (500k tier is $450/year) |
| Cookies | None by default, no device storage | None, and no cookie-based mode exists |
| Visitor identification | Daily-rotating salted hash of IP, user agent and project id | Cookieless with pseudo-anonymised IP addresses |
| EU data residency | Analytics event data stored in Germany, for every visitor | EU Isolation, which Fathom states applies to all customers on all plans with no setup. EU visitor IPs stripped inside the EU. Non-EU pageviews go to US servers with the IP anonymised, and the anonymised data for all visitors is held on US servers |
| Funnels | Yes | No |
| Retention and cohorts | Yes | No |
| User profiles and journeys | Yes | No |
| Session replay | Yes, opt-in per project, paid plans only, all text and inputs masked by default | Not available |
| Ecommerce and revenue tracking | Not offered | Yes |
| Data retention | 12 months on free, 5 years on paid | "Forever data retention", for as long as you remain a customer |
| Open source | Yes, AGPL-3.0, source public | Hosted product is closed source. Fathom Lite (legacy v1) is MIT on GitHub |
| Self-hosting | Yes, the same AGPL engine | Not for the current product. Fathom Lite only |
| Support | Community, no SLA | Email support at every tier |
| Operating entity | Independent European service, operated from Spain | Conva Ventures, independently owned, Canadian |

Fathom prices were read directly from the pricing slider on [usefathom.com/pricing](https://usefathom.com/pricing) and re-checked on 2026-07-29, so treat them as accurate as of July 2026. All Fathom pricing is in USD and renews automatically unless cancelled. Note that Fathom's pricing page counts pageviews **and** custom events against the same quota, so an event-heavy site consumes volume faster than its raw traffic suggests.

## The unit of measurement is not the same

This is the trap in any price comparison between the two. Fathom bills on pageviews plus events combined. Privytics bills on events. A site that fires several custom events per pageview will burn through a Fathom quota much faster than a Privytics quota of the same nominal size, and a site that is pure content with no instrumentation will look similar on both. Currencies also differ (EUR against USD), so the headline figures are not directly convertible.

Do the arithmetic against your own traffic before drawing a conclusion. The free Privytics tier lets you measure real volume before committing, and Fathom's 7-day trial does the same over a shorter window.

## Where the products genuinely diverge

**Product analytics.** Fathom tracks conversions, revenue and custom events, with ecommerce and UTM campaign tracking included on every plan. What it does not have is any way to chain events into a multi-step funnel with drop-off rates, group users into cohorts, measure retention over time, or look at an individual user's journey. This is a category difference, not a missing feature. Fathom has chosen not to hold the kind of user-level data that makes those views possible. Privytics does funnels, retention, cohorts and profiles, and identified analytics when you call `identify()` with your own user id and traits. If you are not sure which camp you are in, we go through the split in [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics).

**Session replay.** Privytics offers rrweb-based session replay as an opt-in, per-project feature on paid plans, with all text and inputs masked by default. It is off on the free tier. Fathom does not offer replay at all, which is consistent with its stance that it holds no personal data.

**The free tier.** Fathom is explicit about refusing one. Its pricing page says "Nope, and here's why: we've heavily invested in enterprise-level infrastructure." That is a defensible position for a business that funds its own servers, but it means the only way in is a 7-day trial that asks for a card at sign-up, which is a short window for an analytics tool that needs traffic to accumulate before the dashboard says anything useful. Privytics gives you 10,000 events per month indefinitely, one project, 12 months of retention, no credit card.

**Multiple sites.** Fathom's pricing page states that every plan includes at least 50 sites, with bigger plans including more (75 on the 1M plan, 200 on the 10M plan), and sells extra capacity in packs of 50 for $10 per month as of July 2026. For an agency running many client sites, that is very hard to beat. The Privytics free tier is a single project, and if you are doing client reporting, our [guide for agencies](/for/agencies) covers that setup.

**Where the data physically sits.** Both give you an EU story, but different ones. Fathom states that EU Isolation applies to all customers on all plans with no setup, that EU visitor traffic is routed through an EU-owned CDN, and that the IP is stripped inside the EU so it never reaches US infrastructure. It also states that pageviews from outside the EU go to its US servers with the IP anonymised there, and that once the IP has been removed the anonymous data is stored on its main US servers so dashboards load quickly. EU isolation therefore covers the personal data, the IP address, rather than the whole dataset. That is Fathom's own description of its data flow rather than something a customer can inspect, and the company itself is Canadian. Privytics stores analytics event data in Germany for every visitor, and its sub-processors are an EU data-centre provider in Germany, Polar (US) as merchant of record, Resend (US) for email, and providers for the account database, error tracking, uptime monitoring, CDN delivery and AI features ([full list](/privacy)). Neither arrangement is automatically better. Fathom's default-on IP stripping in the EU is a strong default; Privytics keeps the whole dataset in one EU location.

**Open source.** Privytics is built on OpenPanel, which is AGPL-3.0, and the Privytics source is public. Privytics is an independent service and is not affiliated with, endorsed by or sponsored by OpenPanel. Because the engine is AGPL, self-hosting is always an escape hatch. Fathom's current hosted product is closed source and SaaS only. Fathom Lite, the earlier v1 Golang and Preact codebase, is still on GitHub under the MIT licence (per the repository metadata, not Fathom's own marketing) and is self-hostable. Fathom's own README comparison table puts a lot on the hosted side of the line: cookie-free tracking, the current dashboard, API access, custom events, ecommerce and UTM tracking, EU isolation, GA import, email reports and CSV exports, more sites per account, and support. It also states that Lite itself uses cookies, and that Lite gets bugfixes rather than new features. Treat Lite as maintained legacy software rather than an open-source version of today's Fathom.

## On cookie banners

Fathom states plainly that no cookie banners are required and markets "privacy-first analytics that works under GDPR without consent popups". Privytics is also cookieless by default: it sets no cookies and uses no device storage for anonymous analytics, identifying visitors with a daily-rotating salted hash instead, which is the mechanism we take apart in [what is cookieless analytics](/blog/what-is-cookieless-analytics). It also ships consent gating so you can initialise with `disabled: true` and call `ready()` after consent if you want it. We work through the reasoning behind that in [cookieless analytics and the GDPR cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

Two honest caveats apply to both products. First, "no banner needed" is a vendor's legal reading, not a regulator's ruling. Second, neither tool makes you GDPR compliant. Cookieless collection, EU hosting and an available DPA are design choices that can support your compliance work, not a compliance guarantee. You remain the data controller and you are responsible for your own position, including your privacy notice, your lawful basis and your own assessment of whether a banner is required in your jurisdiction. None of this is legal advice, so take your own where it matters.

## When Fathom Analytics is the better choice

Be honest with yourself about what you actually need. Pick Fathom if:

- **You want web analytics, not product analytics.** If the questions are "which posts get traffic", "which campaigns convert" and "where do referrals come from", Fathom answers them well and Privytics is more machinery than you need. If your shortlist is Fathom against another simple web analytics tool rather than against us, we compare [Plausible and Fathom directly](/blog/plausible-vs-fathom).
- **You run many sites.** At least 50 sites on every plan, scaling upward on higher tiers, is excellent value for agencies and for anyone with a portfolio of small properties.
- **You need a vendor with a track record.** Fathom has years of operation, paid email support at every tier and no VC pressure behind it. Privytics is the newer service, with community support and no SLA. If downtime would hurt you, that difference is the whole decision.
- **You want data kept indefinitely.** Fathom markets "forever data retention" and states that your full analytics history stays available while you are a customer, rather than expiring on a schedule. Privytics caps retention at 12 months on the free tier and 5 years on paid.
- **You need ecommerce and revenue reporting out of the box**, or password-protected read-only dashboards to share with clients.
- **Most of your audience is outside the EU** and you would rather have a US-and-EU split with default IP stripping than a single EU location.

## FAQ

### Does Fathom Analytics have a free plan?

No. Fathom offers a 7-day free trial, and its pricing page answers "do you have a lower/free option?" with "Nope". Fathom's own support docs state that a credit card is required at sign-up, that the trial has no usage restrictions, and that it emails you before charging on the seventh day. Privytics has a permanent free tier of 10,000 events per month with no card required.

### How much does Fathom Analytics cost?

As of July 2026, read from the pricing slider at [usefathom.com/pricing](https://usefathom.com/pricing): $15/month for 100,000 pageviews, $25 for 200,000, $45 for 500,000, $60 for 1M, $100 for 2M, $140 for 5M, $200 for 10M, rising to $470 for 25M, with custom pricing above that. All figures are USD and every plan includes all features.

### Can Privytics replace Fathom Analytics?

It depends on what you use Fathom for. Privytics covers dashboards and custom events, and adds funnels, retention, cohorts and profiles that Fathom does not have. What you give up is Fathom's operating history, its paid email support, its ecommerce and revenue reporting, and its very large bundled site counts.

### Does either tool need a cookie banner?

Both are cookieless by design and both vendors position themselves as working without consent popups. That is a legal reading rather than a guarantee, and you remain responsible for deciding what your own jurisdiction and your own full stack require.

### Is Fathom Analytics open source?

The current hosted product is closed source and SaaS only. Fathom Lite, the older v1 codebase, is still available under the MIT licence on GitHub and can be self-hosted, but it is feature-reduced compared with the hosted product. Privytics is built on the AGPL-3.0 OpenPanel engine and its source is public.

## Trying Privytics

If Fathom already answers your questions, stay with it. If you have hit the wall where individual event counts stop being enough and you need to see drop-off across a multi-step flow, Privytics has a free tier: 10,000 events per month, no credit card, and you can export your data or self-host the engine at any point.
