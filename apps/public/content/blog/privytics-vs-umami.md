---
slug: privytics-vs-umami
title: "Privytics vs Umami: managed EU analytics vs free self-hosting"
description: "Privytics vs Umami compared: pricing, EU data residency in Germany, cookieless tracking, session replay and when self-hosting Umami is the better call."
date: 2026-07-19
updated: 2026-07-29
tag: Comparison
---

Umami is an MIT-licensed, cookieless analytics tool you can self-host for free, and it has a large open-source following, roughly 37,900 GitHub stars as of July 2026. Privytics is a managed, EU-hosted service built on the open-source OpenPanel engine. The short version: if you are happy running a Postgres instance and keeping it patched, backed up and scaled, Umami is excellent and costs you nothing in licence fees. Privytics is for people who do not want to operate any of that, and who want funnels, cohorts and session replay without either a $200/month jump or a server of their own.

This is a vendor comparison written by Privytics, so read it with that in mind. Every Umami price and plan detail below was checked against the vendor's own pricing page and docs on 29 July 2026, and those sources are linked. All prices are as of July 2026. Vendors change plans, so check the current pages before you decide.

## The direct answer

Choose Umami if you want a permissive licence, a free self-hosted deployment with no event cap, or a very cheap hosted plan for a lot of websites. Choose Privytics if you want analytics event data stored in Germany, no infrastructure to operate, and session replay available on the entry paid plan rather than the top one.

## Side-by-side comparison

| | Privytics | Umami |
|---|---|---|
| Model | Managed service only | Managed cloud plus free self-hosting |
| Licence of the engine | AGPL-3.0 (OpenPanel) | MIT |
| Free tier | 10,000 events/month, 1 project, 12 months retention, no card required | Hobby: 100K events/month, 1 website, 6 months retention |
| Entry paid plan | EUR 10/month for 100k events (ex VAT) | Pro: $20/month for 1 million events |
| Higher tiers | EUR 20 / 500k, EUR 40 / 1M, EUR 100 / 5M, EUR 200 / 10M, custom above 10M | Business: $200/month for 10 million events; Enterprise: custom pricing |
| Overage behaviour | Move up a plan, stepped tiers rather than usage metering | Metered per event ($0.00003 on Pro, $0.00002 on Business), collection is not interrupted |
| Paid retention | 5 years | 2 years (Pro), 5 years (Business) |
| Analytics data location | Germany only | "Servers located in the US and EU"; region selection not documented |
| Cookies | None by default | None |
| Session replay | Included on all paid plans, from EUR 10/month | Cloud: Business only, $200/month, 5,000 replays included, then $0.005 per replay |
| Replay privacy default | All text and inputs masked | Moderate mask level (inputs), strict mode available |
| Heatmaps | Not offered | Yes, Business tier on Cloud |
| Core Web Vitals | Not offered | Yes, performance report |
| Free trial on paid plans | Free tier instead | 14 days on all paid subscriptions |
| Billing | Polar as Merchant of Record, collects and remits EU VAT | Stripe as payment processor per Umami's docs; Merchant of Record not documented |

Umami prices are from [umami.is/pricing](https://umami.is/pricing) and [docs.umami.is/docs/cloud/subscription](https://docs.umami.is/docs/cloud/subscription), checked 29 July 2026 and correct as of July 2026. The pricing page shows amounts with a "$" symbol and does not label the currency string explicitly. Privytics prices are in euro and exclude VAT, so do not read the two columns as a straight numeric comparison.

## Where Umami is cheaper, and it is not close

At one million events per month, Umami Pro is $20 and Privytics is EUR 40, as of July 2026. Umami Pro also covers up to 20 websites and 10 team members at that price. If you run a portfolio of sites and your instrumentation is mostly pageviews, Umami's price per event is hard to beat among hosted tools.

Self-hosting widens the gap. Umami is MIT licensed, not open-core and not BSL, and the vendor imposes no event or site caps on self-hosted installs. The install docs list the requirements as Node.js 18.18 or newer and PostgreSQL 12.14 or newer, and you can run it from source or Docker. The licence cost is zero. The operational cost is not, and that is the actual trade being made.

One caveat before you pick self-hosting to save money: the vendor states that "Cloud also includes additional features like email reports and the streaming API that are not available in the self-hosted version". The self-hosted build and Cloud are not feature-identical.

## Where the free tiers actually differ

Umami's free Hobby tier is more generous than ours on volume, by a factor of ten: 100K events per month against our 10,000. It is also unusually generous on features. Funnel analysis, user retention, user journeys, goals, revenue, attribution, custom events, event properties, session properties, realtime events, custom dashboards and data export are all listed on Hobby in the plan comparison table, not stripped out. That puts a fair amount of [product analytics rather than plain web analytics](/blog/product-analytics-vs-web-analytics) inside a free plan, which is rare in this category.

What Hobby lacks: API access, teams and team members, data import, email reports, session replays and heatmaps. Retention is 6 months and you get one website. Whether a credit card is required to start Hobby is not stated on the pricing page or the cloud FAQ, so we will not claim either way.

The Privytics free tier is 10,000 events per month, one project, 12 months of retention, community support and no SLA, with no card required. Smaller on volume, longer on retention, and no session replay.

## How Umami counts events

Umami's pricing FAQ is explicit about how usage is counted: each pageview counts as one event, and if you save event properties, each data property stored also counts as one event. An event with eight properties is nine billable units, so property-rich instrumentation consumes quota faster than a pageview-only estimate suggests. Model your real payload shape before comparing plan sizes across any two vendors, including ours.

Umami also does not hard-stop paid accounts. Exceeding the plan bills a per-event overage rate that differs between tiers: $0.00003 per additional event on Pro and $0.00002 on Business, both read from the pricing page on 29 July 2026. In the vendor's words, "your data collection will not be interrupted and you won't lose any data". Rates like these are easy to misread by an order of magnitude, so check the current figures on [umami.is/pricing](https://umami.is/pricing) yourself before modelling a spiky month.

One thing worth confirming when budgeting: the Umami pricing page FAQ says "Billing occurs on a monthly basis", while the cloud FAQ says "Billing occurs on either a monthly or annual basis". Both were read on 29 July 2026. We could not find published annual rates anywhere, so ask the vendor if annual billing matters to you. The subscription docs state that Umami uses Stripe as its payment processor, and they do not say who acts as Merchant of Record.

## Session replay is the sharpest split

Both products record sessions with rrweb. On the Umami side, rrweb is listed as a dependency in the repository's package.json, read at version 3.2.0 on 29 July 2026.

The difference is packaging. On Umami Cloud, replay and heatmaps sit on the $200/month Business plan rather than the $20 Pro tier, with 5,000 replays included and $0.005 per replay after that, as of July 2026. The [replay docs](https://docs.umami.is/docs/replays), checked 29 July 2026, state that replays are stored for 30 days regardless of your plan retention, that "only sessions that start after enabling the feature will be recorded" and existing history is not backfilled, and that the default sample rate is 0.15, so out of the box you capture 15% of sessions until you raise it. Raising it raises quota consumption. Self-hosted Umami documents replay with no stated plan restriction, though the docs do not directly address self-hosted versus Cloud parity for the feature.

Privytics includes session replay on every paid plan, starting at EUR 10 per month. It is opt-in per project and masks all text and all inputs by default. If you want replay, cannot justify $200 a month, and will not run your own server, that is the clearest reason to look at us. Whichever tool you pick, turning replay on changes your consent analysis, and we work through why in [session replay and GDPR consent](/blog/gdpr-session-replay-consent).

## Data residency and the cookie banner question

Umami Cloud states, identically on its pricing page and in its cloud FAQ, that "Umami Cloud servers are located in the US and EU and adhere to GDPR and CCPA regulations". An EU presence exists. What is not documented anywhere we could find is whether a customer can select or be guaranteed EU-only residency, or how data routes between the two regions. If you need residency as a contractual guarantee rather than an inference, self-hosting Umami gives you an unambiguous answer because you choose the infrastructure.

Privytics stores analytics event data in Germany. Our sub-processors, including US-based ones for billing, email, monitoring and AI features, are listed in Section 7 of our [privacy policy](/privacy). We have not investigated Umami's DPA availability, sub-processor list or certification status, so we make no claim there.

On cookies, both tools are cookieless. Privytics sets no cookies and uses no device storage for anonymous analytics. The anonymous visitor id is a daily-rotating salted hash of IP address, user agent and project id, and the salt rotates at midnight UTC, so ids reset daily and cannot follow a person across days. That mechanism, and what it costs you in returning-visitor accuracy, is explained in [what cookieless analytics is](/blog/what-is-cookieless-analytics). Identified analytics happen only when you call identify() with your own user id and traits, and consent gating is built in via initialising with disabled:true and calling ready() after consent.

Umami lists "No cookie banners required" as a feature row on all four tiers and answers "No" to the question of whether you need a banner. That is a defensible position for pageview analytics, but it is the vendor's own reading rather than a regulator's ruling, and we found no qualification of it for session replay, which captures materially richer data. We walk through the reasoning in [cookieless analytics and the GDPR cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

We will not tell you that using Privytics makes you GDPR compliant either. What we can describe is the design: cookieless by default, analytics event data stored in Germany, replay masked and opt-in, and a DPA available from us. You remain the data controller, your obligations depend on your configuration and jurisdiction, and nothing here is legal advice.

## When Umami is the better choice

- **You are happy operating Postgres.** Self-hosted Umami is free under MIT with no vendor-imposed caps. If backups, upgrades and scaling are already part of your job, this is the cheapest credible option in the category.
- **You run many websites on a small budget.** $20/month for up to 20 websites, 10 team members and a million events is aggressive pricing that we do not match.
- **You want a permissive licence.** MIT is more permissive than the AGPL-3.0 the OpenPanel engine uses. If you intend to modify and redistribute without copyleft obligations, that matters.
- **You need heatmaps or Core Web Vitals.** We do not offer either. Umami documents both.
- **Your free-tier volume is between 10,000 and 100,000 events a month** and 6 months of retention is enough. Umami's free tier simply fits and ours does not.
- **You want a large, active open-source community.** Umami has a big GitHub following and a mature Docker self-hosting story. The OpenPanel engine that Privytics builds on has a smaller community.

## When Privytics fits better

You do not want to run infrastructure, you want analytics event data in Germany rather than split across two regions with no documented selection, you want session replay without the $200/month tier, and you want 12 months of retention on free or 5 years on paid. Our product surface is funnels, retention, cohorts, dashboards, profiles, custom events and a REST API, with SDKs for the usual web and mobile stacks plus Node, Python, Ruby, Rust and Java.

Privytics is a newer service than Umami, which has been operating for years, so we will not claim to be faster or more reliable than anything. We run the open-source [OpenPanel engine](/blog/privytics-vs-openpanel), which is AGPL-3.0, and our source is public at [github.com/sergiarguimbau/privytics](https://github.com/sergiarguimbau/privytics). We are an independent service and are not affiliated with, endorsed by or sponsored by OpenPanel. You can export your data at any time, and because the engine is AGPL, self-hosting the same engine is always an option.

## FAQ

### Is Umami really free?

Self-hosting is free under the MIT licence with no event or site caps from the vendor, and Umami Cloud has a permanent free Hobby tier at 100K events per month. Self-hosting still costs you a server, a Postgres database and the time to maintain both.

### Does Umami store data in the EU?

Umami Cloud says its servers are located in the US and EU. It does not document whether you can choose or be guaranteed the EU region. Privytics stores analytics event data in Germany.

### Which one is cheaper for one million events a month?

Umami Pro at $20/month against EUR 40/month on Privytics, taken from [umami.is/pricing](https://umami.is/pricing) on 29 July 2026. Both figures are as of July 2026, and Umami is cheaper at that volume.

### Do I need a cookie banner with either tool?

Both are cookieless by default, which removes the most common reason for a banner. Neither vendor can decide your compliance for you, and enabling session replay changes the picture because it captures far more than pageview counts. Take your own legal advice.

### Can I get session replay without paying $200 a month?

On Umami Cloud, no, replay is a Business-tier feature. Self-hosted Umami documents replay with no plan restriction. Privytics includes replay on all paid plans from EUR 10/month, masked by default.

## Trying either tool

If Umami fits your situation better after reading this, use Umami. It is a good tool with an honest licence. If you would rather have this run for you, with the data in Germany, the Privytics free tier is 10,000 events a month with no credit card, and you can export everything you send us whenever you like.
