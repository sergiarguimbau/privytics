---
slug: free-analytics-no-credit-card
title: "Free analytics with no credit card (2026)"
description: "Free analytics with no credit card in 2026: which tools have a real free tier, exactly what each one includes, and where the free plan runs out."
date: 2026-07-22
updated: 2026-07-29
tag: Comparison
---

"Free" and "no credit card" are two different promises, and a lot of analytics tools quietly only keep one of them. Some are free but ask for a card to start a trial that turns into a bill. Some are genuinely free forever but want a badge on your site. Some are free at low volume and get usage-based above a threshold you might hit sooner than you think.

This post sorts the honest free options from the trials, tells you exactly what each free tier includes, and says where the free plan runs out. Privytics is one of the tools here, and it is not the right pick for everyone, so this is a roundup rather than a sales page.

Prices and terms below are as of July 2026 and were re-checked on 2026-07-29 against each vendor's own pricing page. Where a figure could not be confirmed on the vendor's own page, the text says so rather than guessing. Verify current figures before you act, since sliders and free-tier limits change often. Nothing here is legal advice.

## Comparison table

| Tool | Free without a card? | Free tier terms | Type | Cookieless by default | Self-host |
|------|----------------------|-----------------|------|-----------------------|-----------|
| Privytics | Yes | 10,000 events/mo, 1 project, 12-month retention, no badge | Product | Yes | Engine is open source (OpenPanel, AGPL) |
| Umami Cloud | Yes | Free Hobby plan: 100K events/mo, 1 website, 6-month retention | Web + basic funnels/retention | Yes | Yes (MIT) |
| PostHog | Yes | 1M product events/mo, then usage-based | Product | No (cookies by default) | Yes (Cloud-steered) |
| GA4 | Yes | Free standard tier, high limits | Hybrid web + marketing | No (needs consent) | No |
| Matomo (self-host) | Yes (self-host only) | Unlimited, you run the server | Full GA replacement | Configurable | Yes (GPL) |
| Simple Analytics | Yes (with badge) | Unlimited pageviews, 30-day history, 1 user, 5 sites | Web | Yes | No |
| Plausible | No (30-day trial, no card to start) | Trial only, then from USD 9/mo at 10k pageviews | Web | Yes | Yes (AGPL) |
| Fathom | No (7-day trial) | Trial only, then paid tiers priced by pageview volume | Web | Yes | No |

## Privytics: 10,000 events free, no card

Privytics gives you 10,000 events per month free with no credit card, one project, and 12-month retention on the free tier. It is product analytics, not just pageview counting, so the free plan includes custom events, funnels, retention, cohorts, dashboards, per-user Profiles, and a REST API.

It is cookieless by default. The anonymous visitor id is a daily-rotating salted hash of IP, user agent, and project id, and the salt rotates at midnight UTC. Nothing is written to the device, so the anonymous case needs no consent banner, which is the mechanism explained in [what cookieless analytics is](/blog/what-is-cookieless-analytics). Cross-session and cross-device tracking is opt-in through identify() with your own user id, which keeps you in control of when you cross into identified analytics. It is a managed service, analytics event data is stored in Germany, and it runs on the open-source OpenPanel engine (AGPL). Privytics is an independent service and is not affiliated with or endorsed by OpenPanel.

The honest caveats: the free tier is 10,000 events per month, which is well below PostHog's free ceiling and below what Umami Cloud's free plan is pitched at. Paid plans are stepped tiers rather than usage metering, at EUR 10 per month for 100k events, EUR 20 for 500k, EUR 40 for 1M, EUR 100 for 5M, and EUR 200 for 10M, all excluding VAT. Paid also adds session replay and 5-year event history. Privytics is a newer service than PostHog, GA4, or Matomo, which have been operating for years, so if you want a big free allowance or a long track record, that counts against Privytics today.

## Umami: a genuinely free Cloud plan

Umami Cloud's Hobby plan is free with no card required, and Umami's own documentation describes it as "completely free", aimed at personal projects and low-traffic sites. Umami's pricing page lists the Hobby plan at up to 100K events a month, one website and six months of data retention (checked 2026-11-16), so check it again before you commit. It is cookieless and needs no banner, and it is MIT-licensed, so self-hosting is free too if you would rather run it yourself. We go feature by feature in [Privytics vs Umami](/blog/privytics-vs-umami).

Umami used to be easy to file under "simple web analytics," but that is now imprecise. Umami Cloud lists Funnel Analysis, User Retention, and User Journey as report types, alongside Goals, Revenue, and Attribution, so it has moved past pure pageview counting. It is still lighter than a full product-analytics suite, but the clean split between [product analytics and web analytics](/blog/product-analytics-vs-web-analytics) does not really apply anymore.

Where it can fall short: cloud region specifics are not spelled out clearly and servers sit in both the US and EU, so if you need a documented EU-only guarantee you have to confirm it. Paid tiers scale up from the free plan by event volume. Umami's docs list session replays (since v3.1) and heatmaps (since v3.2) but do not say which plans include them, so check the pricing page for both the tier prices and the feature gating.

## PostHog: 1M events free, then usage-based

PostHog has the biggest free tier by raw volume: 1M product-analytics events per month free, then usage-based pricing (roughly USD 0.00005 per event in the low millions, dropping at scale). Each product (analytics, replay, feature flags) has its own separate free allowance, so you can lean on several without paying. It is full product analytics: funnels, retention, cohorts, session replay, feature flags, and experiments. You can host in EU Cloud (Frankfurt) or US Cloud, chosen at signup.

The catch for privacy-first setups: PostHog uses cookies by default. The default persistence writes distinct_id and session data into a 365-day cookie, so a standard install generally needs a consent banner. A cookieless mode exists but is opt-in. PostHog is also genuinely complex. It is an all-in-one platform, which is powerful if you want everything and heavy if you just want clean numbers. Self-hosting is open source but PostHog now steers non-hobby users to Cloud.

## Google Analytics 4: free, but cookie-based

GA4 is free with high limits and no card, which is why it is the default for millions of sites. It is a hybrid of web analytics and marketing attribution, and it does have funnel exploration and cohort exploration through Explorations, plus Google Ads and BigQuery integration. If you live in the Google ad ecosystem, that gravity is real.

It is the weakest option on privacy and residency. GA4 uses cookies and requires consent (via Consent Mode and behavioral modeling for unconsented traffic), so you need a banner. It is US-based, operating under the EU-US Data Privacy Framework, and there is no true EU-only, EU-owned residency. It is proprietary and not self-hostable. "Free" here also means your visitor data feeds Google's wider machinery, which is the trade many people are trying to leave.

## Matomo: free if you self-host

Matomo is free if you self-host. The Community edition is free and unlimited, and it is a full GA-style replacement: pageviews plus funnels, cohorts, heatmaps, session recordings, and goals. It is GPL, so you can run it wherever you want, which makes EU residency fully controllable. Some advanced features are paid add-ons on self-hosted but bundled on Cloud.

Two honest points. First, "free software" is not "free to operate": self-hosting Matomo means a server, updates, and maintenance, which is real ongoing work. Second, Matomo Cloud is paid-only (free trial, no card needed to start it): Starter is EUR 29/mo for 50k hits, with data stored in Frankfurt. Matomo can run cookieless with a one-click CNIL exemption / no-banner mode, but that is a configuration choice, not the out-of-the-box default.

## Simple Analytics: free with a badge

Worth a correction to a common assumption: Simple Analytics is no longer strictly paid-only. Its pricing page now advertises a free-forever plan (1 user, up to 5 sites, unlimited pageviews under their fair use policy, one month of history) that requires a badge on your site, alongside a 14-day full-feature trial. It is cookieless with no banner, and the company and servers are in the Netherlands, so data stays in the EU.

The limits are real: 30-day history is short, and the free plan requires you to display their badge. It is web analytics (pageviews, sources, events and goals on paid), with no funnels, retention, or cohorts, and it is closed-source and cloud-only. Paid self-serve starts at EUR 20/mo. If you want a clean, private, badge-and-done free counter for a small site, it is a fair option.

## When another tool is the better choice

Several tools here beat Privytics on specific axes. Pick one of them when your situation matches.

**You already exceed ~10,000 events per month.** That is the Privytics free ceiling. PostHog's free tier (1M product events per month) and Umami Cloud's free Hobby plan both give you more headroom before paying.

**You never want to pay, at any scale.** Self-hosting wins on cost at volume. Matomo Community or self-hosted Umami are free forever if you are willing to run and maintain the server. Privytics is managed, so above the free tier you move onto a paid plan.

**You want pure, lightweight web analytics.** If you only need pageviews, sources, and top pages, product analytics is more than you need. Plausible, Fathom, or Simple Analytics are simpler and purpose-built for that, though the first two are trial-then-paid. If those two are your shortlist, [Plausible vs Fathom](/blog/plausible-vs-fathom) compares them directly.

**You need a large, established vendor now.** PostHog, GA4, and Matomo have been operating for years and are far more established. If a long track record is a hard requirement, pick one of those.

**You are deep in Google's ad stack.** GA4's native Google Ads and BigQuery links are hard to replace, even if the privacy trade-offs are worse.

**Your site lives on Vercel.** The bundled Web Analytics looks free until you read the plan smallprint; our [Vercel Web Analytics comparison](/blog/privytics-vs-vercel-analytics) walks through what each plan actually includes.

## FAQ

### Which analytics tools are genuinely free with no credit card?
Privytics (10,000 events/mo), Umami Cloud's Hobby plan, PostHog (1M product events/mo then usage-based), and GA4 (free standard tier) all start free with no card. Matomo is free if you self-host, and Simple Analytics has a free-forever plan that requires a badge. Plausible and Fathom are trial-only, so they need a card to continue.

### Is a free tier the same as a free trial?
No, and the difference matters. A free tier stays free within its limits indefinitely. A free trial (Plausible's 30 days, Fathom's 7 days) ends, and after that you pay to keep using the tool. The card is not always the tell: Plausible and Matomo both state that no card is needed to start their trials. The real question is whether the tool stays free at all once the clock runs out. If you want to avoid ever being charged, start with a real free tier, not a trial.

### Do any of these free tools avoid the cookie consent banner?
Yes. Privytics, Umami, and Simple Analytics are cookieless by default, so the anonymous case does not need a banner. GA4 and PostHog use cookies by default and generally require consent. Matomo can be configured to run cookieless, but that is not its default setup. For the reasoning behind that, see [cookieless analytics and the GDPR cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

### What is the catch with free analytics tools?
It varies. GA4 is free because your data feeds Google's ad ecosystem. Simple Analytics' free plan requires a badge on your site and keeps only 30 days of history. Umami and PostHog free tiers are generous but eventually meter you at volume. Privytics caps free usage at 10,000 events per month. Self-hosting is free of subscription cost but not free of server and maintenance work.

### When do I outgrow a free analytics tier?
Usually when your traffic passes the event or pageview ceiling, or when you need longer retention than the free plan offers. Privytics free covers 10,000 events with 12-month retention and PostHog free covers 1M events, while Umami publishes its free Hobby limits on its pricing page rather than in its docs, so check the event and retention figures there. Watch retention as closely as volume, since short history windows force upgrades even at low traffic.

### Is self-hosting really free?
The software is free (Matomo, Umami, and the OpenPanel engine behind Privytics are all open source), but running it is not. You pay in server costs, updates, backups, and your own time. For small sites a cheap VPS is inexpensive; at scale, self-hosting is cheaper than managed plans if you have the appetite to operate it.

## Trying Privytics free with no credit card

If you want managed, cookieless product analytics stored in Germany, and 10,000 events a month is enough to start, Privytics is free with no credit card and 12-month retention. Everything listed in the Privytics section above is on the free tier, including funnels, retention, and cohorts, and anonymous traffic needs no consent banner. Paid plans (from EUR 10 per 100k events, excluding VAT) add session replay and 5-year event history when you grow.

If you would rather have a larger free ceiling, a longer-established vendor, or a pure pageview counter, one of the other tools above is the more honest fit. If a private, product-focused starting point sounds right, Privytics is built for exactly that.
