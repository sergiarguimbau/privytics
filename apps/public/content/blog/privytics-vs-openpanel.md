---
slug: privytics-vs-openpanel
title: "Privytics vs OpenPanel: Same Engine, Two Different Operators"
description: Privytics runs the open-source OpenPanel engine. An honest comparison of price, free tier, session replay, hosting and when to pick OpenPanel instead.
date: 2026-07-19
updated: 2026-11-16
tag: Comparison
---

This is the one comparison on this site where the product is not in question, because it is the same product. Privytics is a managed service built on the open-source OpenPanel analytics engine. Same dashboard, the same product-analytics surface of [funnels, retention, cohorts and profiles](/blog/product-analytics-vs-web-analytics), same SDKs. The only thing that differs is who runs the servers, what the bill looks like, and what happens at the free end of the range. If you are choosing between us and OpenPanel Cloud, you are choosing an operator, not an engine.

Say it plainly before anything else: Privytics is an independent service and is not affiliated with, endorsed by, or sponsored by OpenPanel. The OpenPanel server and platform code is licensed AGPL-3.0 and the client SDKs are MIT. We use the AGPL grant the way it is meant to be used, and our source is public at [github.com/sergiarguimbau/privytics](https://github.com/sergiarguimbau/privytics). If this post reads as a pitch to move away from OpenPanel, we have written it badly. For a lot of readers, OpenPanel Cloud or self-hosting OpenPanel is the right answer, and the sections below say exactly when.

## Side by side

| Attribute | Privytics | OpenPanel Cloud |
| --- | --- | --- |
| Engine | OpenPanel (AGPL-3.0) | OpenPanel (AGPL-3.0) |
| Relationship | Independent operator, not affiliated | The project's own hosted service |
| Free tier | 10,000 events/month, no card | No general free tier. 30-day trial, no card required. Free plan for open-source projects on application, up to 2.5M events/month |
| Entry paid price | EUR 10/month for 100k events (excl. VAT) | USD 2.50/month for 5,000 events (excl. VAT) |
| 100k events | EUR 10/month | USD 20/month |
| 1M events | EUR 40/month | USD 90/month |
| 10M events | EUR 200/month | USD 350/month |
| Annual discount | Not offered | Yearly billing, 2 months free |
| Data location | EU data centres in Germany | EU data centres in Germany, per its DPA |
| Operating entity | Independent European service, operated from Spain | OpenPanel AB, Stockholm, Sweden |
| Cookies | None. Nothing written to the visitor's device | None. Cookieless by architecture |
| Visitor ID method | Daily rotating salted hash of user agent, IP and project id | The same, because it is the same engine code |
| Funnels, retention, cohorts | Yes | Yes |
| Session replay | Paid plans only, opt-in per project, all text and inputs masked by default | Not sold as a separate add-on. Unlimited replays, 30-day retention |
| Event data retention | 12 months free, 5 years paid | DPA states analytics events are retained for as long as the account is active, with no maximum currently enforced; session replays 30 days |
| Projects | 1 on free tier | Unlimited websites/apps, users, dashboards and charts at every tier |
| Self-hostable | Yes, same engine | Yes, free with no event cap |
| Billing | Polar as Merchant of Record, collects and remits EU VAT | Vendor billing, VAT added where applicable |

Every OpenPanel figure in this post, prices and everything else, was re-checked on 2026-11-16 against OpenPanel's own pages: the [pricing page](https://openpanel.dev/pricing), the [open-source programme](https://openpanel.dev/open-source), the [DPA](https://openpanel.dev/dpa), the [terms](https://openpanel.dev/terms) and the [self-hosting docs](https://openpanel.dev/docs/self-hosting/deploy-docker-compose). All prices on both sides are as of November 2026 and may have moved since. Check them before you decide. Note that OpenPanel lists in USD and Privytics lists in EUR, so any direct comparison moves with the exchange rate on the day you pay. Do the conversion yourself rather than trusting a table.

## Where the two genuinely differ

### The free end of the range

This one needs stating carefully, because "OpenPanel has no free tier" is the kind of shorthand that is simply wrong. OpenPanel Cloud has no general-purpose free tier for commercial use: you get a 30-day trial with no credit card, then you pick a paid volume tier. But it does run a free plan for open-source projects, and it is a generous one, up to 2.5 million events a month at no cost for projects with an OSI-approved licence, a public repository and active development. It is granted on application rather than automatically, and OpenPanel states the project's primary purpose should be non-commercial, though it will consider commercial open-source projects. If you are shipping open source, that offer is far better than anything we have, and you should take it.

Privytics has a [permanent free tier with no credit card](/blog/free-analytics-no-credit-card): 10,000 events per month, one project, 12 months of retention, community support, no SLA. Nothing expires.

But look at what OpenPanel charges rather than only at the word "free". Its entry tiers are low single-digit dollars a month at small volumes, and they come with unlimited projects. If you have a real product and a real budget, the free tier is a weaker argument than it looks. Where it matters is a side project you are not sure about yet, or a client site you do not want to add a recurring line item for.

### Price at volume

Above the entry tiers the ladders diverge. As of November 2026, at 100,000 events Privytics lists EUR 10 against OpenPanel's USD 20, at 1 million it is EUR 40 against USD 90, and at 10 million it is EUR 200 against USD 350. OpenPanel also sells volume tiers above the range we publish, and offers yearly billing at an effective two months free, which narrows the gap if you pay annually.

We are not going to dress this up as a fairer pricing philosophy. It is the same software, so the difference is a margin decision and a cost base, nothing more. OpenPanel also carries the cost of building the thing, which we do not.

### Session replay

OpenPanel's plans differ by event volume rather than by feature set, and replay is not sold as a separately metered add-on. Unlimited replays with 30-day retention are documented on its [session replay feature page](https://openpanel.dev/features/session-replay), and the same 30-day window appears in its [DPA](https://openpanel.dev/dpa). We could not find a tier-by-tier feature table on the pricing page, so if replay on the cheapest plan specifically is your deciding factor, confirm it with them first.

Privytics restricts replay to paid plans and switches it off on the free tier. It is opt-in per project and masks all text and inputs by default, which is where the [consent question around session replay](/blog/gdpr-session-replay-consent) starts rather than ends, whichever operator you pick. If replay at the lowest possible price is what you want, OpenPanel wins that outright and we would rather say so than pretend it is a tie.

### The operator behind the DPA

Both are EU entities and both keep event data in Germany. OpenPanel's [DPA](https://openpanel.dev/dpa) states that analytics data sits in EU data centres in Germany and that standard operations keep data inside the EEA, which is a good starting point for the transfer section of your own assessment. Worth knowing for your paperwork: the [OpenPanel terms](https://openpanel.dev/terms) name the counterparty as OpenPanel AB in Stockholm, governed by Swedish law, while the infrastructure sits in Germany. Both are EU, but the entity is Swedish, not German.

Privytics stores analytics event data in Germany and is operated from Spain. Our sub-processors, including US-based ones for billing, email, monitoring and AI features, are listed in Section 7 of our [privacy policy](/privacy). Ask both of us for a current sub-processor list if you are doing supplier diligence.

### Licensing, and why it matters to you

The OpenPanel repository is AGPL-3.0 at the root, but the client SDK packages ship their own MIT licences. That is a meaningful distinction and it works in your favour whichever service you pick: dropping the SDK into a closed-source product carries no copyleft obligation. The AGPL applies to the server and platform code, which is what makes an independent operator like Privytics possible in the first place.

The practical consequence is that neither of us can lock you in at the engine level. Your instrumentation is the same code either way, your event schema is the same, and self-hosting the same stack is always on the table.

### Reliability and track record

Privytics is a newer service than OpenPanel, which has been running its hosted platform for years and maintains a public repository with an active commit history. Nothing on this page is a claim that we are faster or more accurate. It is the same engine on both sides, so the real differences sit in operation, pricing and paperwork rather than in the analytics themselves.

## When OpenPanel is the better choice

These are real scenarios, not a courtesy section.

- **You want to support the people who built it.** This is the strongest reason and it needs no qualification. OpenPanel Cloud funds the engine that Privytics runs on. If the project's survival matters to you, pay the project.
- **You are an open-source project.** OpenPanel's OSS programme gives qualifying projects up to 2.5M events a month free, which is 250 times our free tier. We cannot compete with that and will not pretend otherwise.
- **You want session replay cheaply.** OpenPanel does not meter replay separately from event volume. We do not offer replay on the free tier at all.
- **You track under about 10,000 events a month and want more than one project.** OpenPanel's plans include unlimited websites, apps, users and dashboards. Our free tier is one project.
- **You want an established company as your DPA counterparty.** OpenPanel AB is a registered Swedish company with a longer operating history. Some procurement processes weight that heavily, and if yours is one of them the decision is already made.
- **You want event data kept for as long as your account is open.** OpenPanel's DPA says analytics events are retained while the account is active, rather than capped at a fixed window. Ours are capped (12 months free, 5 years paid), so at the top end their terms are the more generous ones.
- **You are comfortable running infrastructure.** Self-hosting OpenPanel is free with no event cap and deploys from a single Docker Compose file covering PostgreSQL, ClickHouse, Redis, a Redpanda event broker, the API, the dashboard and the worker, plus an optional Caddy proxy. Their [self-hosting docs](https://openpanel.dev/docs/self-hosting/deploy-docker-compose) state "At least 4GB RAM (6GB+ recommended)", and those docs are the number to size against rather than this page. Data never leaves your servers, which is a stronger residency story than any hosted option. You take on backups, upgrades and uptime in exchange.

## When Privytics fits better

Fewer cases, and they are narrow. You want a permanent free tier rather than a trial clock, and you are not an open-source project that would qualify for OpenPanel's free OSS plan. You want billing in EUR through a Merchant of Record that handles EU VAT for you. You want the lower listed price at every volume, and the exchange rate on the day works out in your favour. That is the honest list.

One thing this page cannot settle for you: if the engine itself is still open, the operator question is premature. Look at the wider field first, for instance in our [roundup of Mixpanel alternatives](/blog/mixpanel-alternatives-2026), and come back to this comparison once OpenPanel is the engine you want.

## FAQ

### Is Privytics just a rebranded OpenPanel?

It is a managed service running the OpenPanel engine, which is AGPL-3.0 licensed and explicitly open to self-hosting and forking. The product surface is the same. Privytics is not affiliated with, endorsed by, or sponsored by OpenPanel.

### Does OpenPanel have a free plan?

For general commercial use, no: OpenPanel Cloud offers a 30-day free trial with no credit card required, then paid tiers starting at USD 2.50 per month for 5,000 events as of November 2026. But it does run a free plan for open-source projects, up to 2.5 million events a month, granted on application to projects with an OSI-approved licence, a public repository and active development. Self-hosting OpenPanel is also free with no event cap.

### Can I move between Privytics, OpenPanel Cloud and self-hosting?

The SDKs and event schema are the same engine, so re-pointing your instrumentation is a configuration change rather than a rewrite. Historical data has to be exported and imported separately, and you should test that path before committing either way.

### Is OpenPanel cheaper than Privytics?

At list prices, no, unless you qualify for OpenPanel's open-source plan. Below 10,000 events Privytics is free, while OpenPanel Cloud charges USD 5 a month for 10,000 events once its 30-day trial ends. Above that, each listed Privytics tier costs less than the OpenPanel tier covering the same volume (EUR 10 against USD 20 for 100,000 events, as of November 2026), but ours is in EUR and theirs in USD, so check the rate. If your project is open source and qualifies for their OSS programme, OpenPanel is free up to 2.5 million events a month and nothing we offer comes close.

### Are both cookieless?

Yes, and by the same mechanism, because it is the same engine code on both sides: an anonymous visitor id derived from a daily rotating salted hash of user agent, IP address and project id, rather than a cookie. That is the approach described in [what cookieless analytics actually means](/blog/what-is-cookieless-analytics). On the Privytics side that means no cookies and nothing written to the visitor's device, event data stored in Germany, a DPA available, and consent gating in the SDK if you want it: initialise with `disabled: true` and call `ready()` once consent is given.

That is a description of how the product is built, not a compliance guarantee. No analytics vendor can make you GDPR compliant. You remain the data controller, the consent decision for your site is yours, and none of this is legal advice.

## Trying Privytics

If the free tier is the thing that decides it, ours is permanent: 10,000 events a month, one project, no card. Export your data whenever you want. And if after reading this you conclude that paying OpenPanel directly or self-hosting the engine yourself is the better call, that is a good outcome too.
