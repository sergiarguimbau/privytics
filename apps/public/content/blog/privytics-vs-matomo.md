---
slug: privytics-vs-matomo
title: "Privytics vs Matomo: Pricing, Cookies and EU Hosting Compared"
description: Privytics vs Matomo compared on pricing, hit-based versus event-based billing, cookies, EU hosting, self-hosting and product analytics depth.
date: 2026-07-19
updated: 2026-07-29
tag: Comparison
---

Matomo is the mature, established open-source alternative to Google Analytics, and it is a genuinely good product. It has close to two decades of web analytics depth, a free self-hosted edition with no limits, and EU data residency on its cloud offering. Privytics is a newer managed service built on the open-source OpenPanel engine, with an event-first data model, cookieless tracking by default, and a permanent free tier. If you want a full Google Analytics replacement with ecommerce, campaign and SEO reporting, Matomo is the stronger tool. If you want simple event analytics on a small budget without running a server, Privytics is worth a look.

Worth saying plainly up front: Privytics is a newer service than Matomo, which has been shipping since 2007. Nothing below is a claim about speed, accuracy or reliability, because everything here is a comparison of published facts.

The short version, as of July 2026: Matomo Cloud starts at about 29 EUR per month, excluding tax, for 50,000 hits, and climbs the traffic ladder into the hundreds of euros per month by 5 million hits. Matomo displays exact figures in a calculator on its pricing page, so check there for your volume. Privytics starts free at 10,000 events per month and costs 100 EUR per month at 5 million events. Matomo bills by hits, which includes every tracked action, not just pageviews. Matomo also sets first-party cookies out of the box. Privytics sets none.

## Feature and pricing comparison

| Attribute | Privytics | Matomo Cloud |
|---|---|---|
| Entry price | Free, 10,000 events/month, no card | ~29 EUR/month excl. tax, 50,000 hits |
| Perpetual free tier | Yes | No, 21-day trial without a card |
| Billing unit | Events | Hits (any tracked action) |
| 1M/month price | 40 EUR/month | 172 EUR/month (1M hits) |
| 5M/month price | 100 EUR/month | Hundreds of EUR/month (calculator-priced) |
| Above 10M | Custom | 1,600 EUR/month at the 10M tier; published higher tiers and custom Enterprise pricing above that |
| Overage | Plan upgrade | Charged per block of extra hits; block size and price scale with the plan |
| Cookies by default | None, cookieless | Yes, `_pk_id`, `_pk_ses`, `_pk_ref` |
| Data location | Germany | Frankfurt, Germany |
| Operating entity | Independent European service, operated from Spain | New Zealand (InnoCraft Ltd) |
| Licence | AGPL-3.0 engine (OpenPanel) | GPL v3 core, premium plugins under InnoCraft EULA |
| Self-hostable | Yes, AGPL source | Yes, On-Premise free and unlimited |
| Session replay | Paid plans, opt-in per project, masked by default | Included on Cloud, metered by traffic tier |
| Data retention | 12 months free, 5 years paid | 24 months raw on standard Cloud, reports kept forever; configurable on Cloud Enterprise |
| Data model | Event-first | Visit and session centric |
| Maturity | Newer service | Since 2007, large install base |

Matomo prices, allowances and retention limits taken from the [Matomo pricing page](https://matomo.org/pricing/) on 29 July 2026, in euros, excluding tax. Annual billing on Matomo Cloud is advertised as two months free, which works out at 220 EUR per year at the 50,000 hit tier.

## Hits versus events, the number that actually decides your bill

This is the single most important difference to model before you commit to either tool.

Matomo Cloud bills by hits. A hit is any tracked action: a pageview, a custom event, a file download, an outbound link click, a site search, or an ecommerce action. If you instrument your product properly, with events for signups, clicks, form submissions and feature usage, your hit count can run at two or three times your pageview count. A site with 50,000 pageviews a month can therefore generate 150,000 hits once real event tracking is on, which lands it on the 300,000 hit tier rather than the 50,000 one. Matomo publishes a cost for additional hits rather than cutting you off, and it is charged per block, with the block size and the price scaling with the plan you are on rather than being one flat per-hit rate. The exact figures appear in the pricing selector once you pick a tier, so check them for the tier you are actually buying. Overshooting is therefore not catastrophic, but it does mean an estimate based on pageviews alone will underprice the plan.

Privytics bills by events, and a pageview is an event too, so the unit is the same idea. The difference is the price per unit and the fact that the entry point is free. The full Privytics ladder, excluding VAT, is 10 EUR for 100,000 events, 20 EUR for 500,000, 40 EUR for 1 million, 100 EUR for 5 million and 200 EUR for 10 million, with a free tier of 10,000 events per month.

Do not read the price gap as a like-for-like verdict on value. Matomo's higher tiers carry a far broader feature set: ecommerce reporting, goals, campaign attribution, SEO reports, log file import, roll-up reporting across sites, white labelling, SAML and LDAP. On Matomo Cloud those premium features are included in the subscription rather than sold as add-ons, which is a meaningful point in Matomo's favour and one that is often reported incorrectly. Heatmaps and Session Recording are included but metered, with allowances that scale by traffic tier: at the entry 50,000 hit tier they are listed as 1,500 heatmap pageviews and 150 session recordings per month, rising at higher tiers. A few other items carry their own allowances or costs, notably Custom Reports and Forms at 100 each, Tag Manager at 30 containers, and a Data Warehouse Connector that is priced separately as an add-on. All figures as listed on 29 July 2026.

## Cookies and consent

Matomo's default JavaScript tracker uses first-party cookies. Matomo documents them openly, and as listed in its own [cookie FAQ](https://matomo.org/faq/general/faq_146/) on 29 July 2026 the defaults are: `_pk_id` for the visitor ID with a 13 month lifetime, `_pk_ses` for the session at 30 minutes, and `_pk_ref` for referrer attribution at 6 months. Those lifetimes are defaults and can be changed in the tracking code. Cookieless tracking is available, but it is an opt-in configuration change and Matomo notes that disabling cookies affects the accuracy of some reports.

Privytics is [cookieless](/blog/what-is-cookieless-analytics) by default. It sets no cookies and uses no device storage for anonymous analytics. The anonymous visitor id is a daily-rotating salted hash of IP address, user agent and project id. The salt rotates at midnight UTC, so ids reset every day and cannot follow a person across days. That is a deliberate trade: you get no cookie banner dependency for the analytics layer, and in exchange you lose true cross-day returning-visitor identity unless you call `identify()` with your own user id.

Matomo's public stance on consent is more careful than most privacy-analytics marketing, and that is to its credit. It does not claim you can drop the banner. Its own [TDDDG guidance for Germany](https://matomo.org/faq/new-to-piwik/configure-matomo-analytics-for-tdddg-ttdsg-compliance/), as published on 29 July 2026, recommends asking for consent before enabling either cookie-based or cookieless tracking, and points to server log analysis as the method that avoids the consent question because it does not interact with the visitor's device.

Neither tool makes you compliant. Cookieless defaults and EU hosting are design decisions that reduce what you have to account for, not a compliance certificate. You remain the data controller, your own assessment is your responsibility, and none of this is legal advice. We work through the reasoning in [cookieless analytics and the GDPR cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner). Privytics ships consent gating for the cases where you need it: initialise with `disabled: true` and call `ready()` after the user consents. A [DPA](/dpa) is available.

## Data model and product analytics

Matomo is web analytics first, in the sense set out in [product analytics versus web analytics](/blog/product-analytics-vs-web-analytics). Its core is visits, sessions, pageviews, referrers, campaigns, ecommerce and SEO. Funnels, Cohorts, Users Flow and Multi Channel Attribution all exist and are included on Cloud, but they sit on top of a session-centric model. If your questions are of the form "which channel drove revenue last quarter" or "how did this campaign perform", that model fits well.

Privytics is event-first. Funnels, retention, cohorts, dashboards, profiles and custom events are built around events and user properties rather than visits, and all of it runs [without cookies](/blog/funnels-retention-cohorts-without-cookies). If your questions are of the form "which users who did X came back in week three", an event-first model is a more natural fit. Privytics is also far narrower: there is no ecommerce reporting suite, no SEO module, no tag manager, no log file import, no A/B testing, no white labelling.

## Self-hosting and licence

Both projects are self-hostable, and both have a proprietary or partly proprietary edge to understand.

Matomo Core and its JavaScript tracker are GPL v3, and free plugins are GPL v3 unless otherwise noted. On-Premise is free forever with unlimited users and unlimited hits. The catch is that the premium plugins, including Funnels, Cohorts, Heatmaps, Session Recording, A/B Testing and Custom Reports, are released under the InnoCraft EULA rather than the GPL. On self-hosted installs those are paid additions, and the support-and-plugin bundles start at 275 EUR per month for the Team tier, or 2,750 EUR billed annually, covering up to 4 users and 5 million hits a month, checked on 29 July 2026. Running Matomo yourself also means running PHP and MySQL or MariaDB, archiving cron jobs, upgrades, security patching and backups, and high-traffic installs typically need database tuning.

Privytics is a managed service built on OpenPanel, which is AGPL-3.0. The Privytics source is public at [github.com/sergiarguimbau/privytics](https://github.com/sergiarguimbau/privytics). Privytics is an independent service and is not affiliated with, endorsed by, or sponsored by OpenPanel. Because the engine is AGPL, self-hosting the same engine is always available to you as an exit route, and you can export your data at any time.

## When Matomo is the better choice

Pick Matomo, not Privytics, if any of these describe you.

- You need a genuine Google Analytics replacement. Ecommerce revenue reporting, goals, campaign attribution, SEO reports and site search analysis are Matomo's home ground and Privytics does not cover them.
- You want a free, unlimited, self-hosted analytics install and you have sysadmin capacity. Matomo On-Premise has no hit ceiling and no user ceiling, and it is a battle-tested deployment that has been in the field since 2007.
- You are buying for a procurement or compliance process. Matomo states on its pricing page that it is certified to ISO 27001:2022, and it publishes sub-processor and residency documentation, a large reference base and a company behind it with a long track record.
- You run many sites or an agency. Matomo Cloud lists 30 websites and 30 team members on the standard plan, more on Cloud Enterprise, plus roll-up reporting and white labelling.
- You need heatmaps, form analytics, A/B testing, media analytics or a tag manager in the same tool. If heatmaps and session recordings are the whole reason you are shopping, that is a different comparison and [Privytics vs Microsoft Clarity](/blog/privytics-vs-microsoft-clarity) is the closer one.
- You need data stored outside the EU. Matomo's own guidance is to use On-Premise for that, which gives you full control of residency. Privytics stores analytics event data in Germany only.

## When Privytics may fit better

Consider Privytics if you want event-first analytics with funnels, retention and cohorts rather than session reporting, if you want cookieless tracking as the default rather than a configuration change, if you want a free tier that does not expire, or if your budget at higher volumes is the binding constraint and you do not need Matomo's breadth. Accept the trade honestly: Privytics covers a fraction of Matomo's feature surface, and Matomo has close to two decades of web analytics work behind it.

## FAQ

### Is Matomo free?

Matomo On-Premise is free forever, with unlimited users and unlimited hits, but you run the server yourself and premium plugins are paid. Matomo Cloud has no permanent free tier, only a 21-day trial with no card required. Prices checked on 29 July 2026 at [matomo.org/pricing](https://matomo.org/pricing/).

### How much does Matomo Cloud cost?

As of July 2026 the entry tier is about 29 EUR per month, excluding tax, for 50,000 hits. Matomo prices the rest of the ladder through a calculator on its pricing page rather than a static table, and the figures it renders climb into the hundreds of euros per month by the millions-of-hits tiers, so check the calculator at your own volume. Annual billing is advertised as two months free.

### Does Matomo use cookies?

Yes, by default. The standard JavaScript tracker sets first-party `_pk_id` (13 months), `_pk_ses` (30 minutes) and `_pk_ref` (6 months) cookies. Those are the defaults and the lifetimes are configurable. Cookieless tracking is supported but must be enabled deliberately, and Matomo notes it affects the accuracy of some reports.

### Is Matomo or Privytics better for product analytics?

They are built on different models. Privytics is event-first, which fits product questions about what users did and whether they came back. Matomo layers funnels and cohorts onto a session-centric model, and it is the broader tool for web and marketing analytics. Both are narrower than dedicated product analytics platforms.

### Can I move off either tool later?

Yes, in both cases. Matomo Core is GPL v3 and On-Premise is free, so Cloud customers can self-host. Privytics runs the AGPL-3.0 OpenPanel engine and supports data export at any time, so the same engine can be self-hosted.

## Getting started

If you want to try the event-first, cookieless approach, the Privytics free tier gives you 10,000 events per month, with one project and no credit card. If Matomo's breadth is what you actually need, use Matomo. The table above should be enough to tell which of the two you are.
