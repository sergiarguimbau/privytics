---
slug: what-is-cookieless-analytics
title: "What is cookieless analytics? A plain-English guide"
description: "Cookieless analytics explained: how tracking without cookies works, why it usually removes the cookie banner, its honest limits, and the tools that do it."
date: 2026-07-22
updated: 2026-07-29
tag: Guide
---

If you have read the phrase "cookieless analytics" on a pricing page and nodded along without being totally sure what it means, this guide is for you. The short version: it is a way to measure who visits your site or app without storing anything in the visitor's browser, which usually means you can skip the cookie consent banner for anonymous traffic. GDPR itself still applies, as the sections below explain.

This is a definitional guide, not a sales pitch. We build one of the tools listed below (Privytics), and we will tell you plainly where the others are the better pick.

*Vendor details checked 2026-07-29. Pricing and free tiers change often, so verify current figures before acting on them. This guide is general information, not legal advice.*

## What cookieless analytics actually means

Cookieless analytics is web or product analytics that counts visitors and their actions without setting cookies (or any other persistent identifier) on the visitor's device.

Traditional analytics drops a small file, a cookie, in your browser with a long-lived random ID. Every time you come back, the site reads that ID and knows it is "you" again. That is what makes cookies useful for tracking, and also what makes them a privacy and legal problem: the ID persists, it can follow you around, and under GDPR you generally need explicit consent before you set it.

Cookieless tools skip that step entirely. There is no persistent ID sitting on your machine. Instead, the analytics tool works out "is this the same visitor as a moment ago?" using signals it already sees in the normal course of serving a request, and it deliberately makes that answer expire quickly.

## How cookieless tracking works

The most common technique is a rotating hashed identifier, and it works like this.

When a request comes in, the analytics server already sees a few things: the visitor's IP address, their browser's user agent string, and which site (project) they are on. None of those raw signals is stored. The server combines them with a secret salt that changes every day, runs the whole thing through a one-way hash function, and gets a short fingerprint. Everyone browsing the same site from the same device on the same day produces the same fingerprint, so the tool can count unique visitors and stitch a single session together. Nothing is written to the visitor's browser.

The important part is the daily rotation. Because the salt changes every day, the fingerprint changes every day too. Yesterday's fingerprint cannot be linked to today's, so there is no durable ID that follows anyone over time. The hash is one-way, so the original IP and user agent cannot be recovered from it. This is how Privytics works: a salted hash of IP, user agent, and project ID, with the salt rotating at midnight UTC and nothing written to the device.

Two things fall out of this design:

- **No cross-site tracking.** The fingerprint is scoped to one project. It cannot be used to recognise you on a different website, which is exactly what third-party cookies were built to do and exactly what privacy regulators object to.
- **No device storage.** Nothing is written to local storage, IndexedDB, or a cookie jar. There is nothing for the visitor to clear, and nothing for an ad blocker to find.

Some tools use variations on this: server-side event collection (events are sent from your backend, so the browser never gets a script at all), or purely session-scoped IDs held in memory. The common thread: no persistent identifier lives on the device.

## Why it matters

**You usually do not need a consent banner for anonymous traffic.** This is the headline benefit. Cookie consent banners exist because you set cookies. Under the EU's ePrivacy rules, storing or reading information on a user's device is what triggers the consent requirement. If your analytics tool never touches the device, that specific trigger does not fire for anonymous measurement. (You may still need a banner for other reasons, for example if your marketing pixels or chat widget set cookies. Cookieless analytics removes one source of banners, not necessarily all of them. There is a longer walkthrough in our guide to [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).)

**It is friendlier to GDPR.** No persistent identifier, no cross-site profile, and data minimised by design is a much easier story to tell your users and your DPO than "we track you with a year-long ID." It does not make you automatically compliant (GDPR covers all personal data processing, not just cookies), but it removes the hardest part.

**Your numbers are more complete.** Cookie-based analytics quietly loses everyone who blocks cookies, browses privately, or declines the banner. Since there is nothing to block or decline, cookieless tools tend to count a larger, truer share of your traffic.

**Pages load a touch faster.** Cookieless scripts are usually small, and with no consent gate you are not delaying measurement until someone clicks "accept."

## The honest limits

Cookieless analytics has real trade-offs, and the biggest one is easy to state.

**There is no durable cross-device or cross-session identity for anonymous visitors.** Because the fingerprint rotates daily and never leaves one device, a person who visits on Monday and returns on Thursday is counted as two different visitors. Someone who browses on their phone and later on their laptop is two visitors, not one. If your entire business depends on stitching an anonymous person's journey together across weeks, cookieless tracking will frustrate you.

In practice this matters less than it sounds, for two reasons. First, cookie-based cross-session tracking was already broken by ad blockers and short cookie lifetimes, so the "durable" identity you thought you had was leaky anyway. Second, the moment a user logs in, you can identify them with your own user ID and get real cross-session, cross-device analytics for that person. Privytics does this with an opt-in `identify()` call: you pass your own user ID, and from then on that user's activity is joined up properly. The anonymous case stays cookieless and banner-free; the logged-in case gives you the durable identity you need, with the user's knowledge.

The other limit worth naming: some cookie-dependent features from the ad world (remarketing audiences, cross-site attribution, ad-platform integrations) simply are not available. If those are core to your work, cookieless is not the whole answer.

## The main cookieless tools

A handful of tools were built cookieless from the start. It is worth splitting them by what they are for: most are web analytics (traffic, pageviews, referrers), while Privytics is [product analytics](/blog/product-analytics-vs-web-analytics) (events, funnels, retention, per-user profiles). Google Analytics 4 and PostHog are not on this list because they use cookies or browser storage by default. PostHog can be configured to hold its identifiers in page memory only, but that is a setting you opt into rather than how it ships. There is a longer roundup with per-tool detail in our guide to the [best cookieless analytics tools](/blog/best-cookieless-analytics-tools-2026).

## Cookieless analytics tools compared

| Tool | Type | Cookieless | Open source | Hosting | Free tier | Paid from |
|------|------|-----------|-------------|---------|-----------|-----------|
| **Plausible** | Web | Yes | Yes (AGPL-3.0) | EU cloud or self-host | Trial | ~$9/mo |
| **Fathom** | Web | Yes | No | Managed cloud | Trial | ~$15/mo |
| **Umami** | Web | Yes | Yes (MIT) | Self-host or cloud | Free (self-host + cloud) | ~$20/mo |
| **Simple Analytics** | Web | Yes | No | EU cloud | Free plan | ~€20/mo |
| **Privytics** | Product | Yes | Engine is AGPL-3.0 | Managed, data in Germany | 10k events/mo | EUR 10/100k |

*Prices are indicative and checked as of July 2026. Confirm on each vendor's site before deciding.*

## Plausible

Plausible is the best-known privacy-first web analytics tool. It is a lightweight script, cookieless, open source (AGPL-3.0), and gives you clean pageview and referrer stats with no consent banner needed. You can use their EU-hosted cloud (paid, from $9 per month for 10,000 monthly pageviews as of July 2026, with a 30-day free trial and no free plan) or self-host the AGPL-licensed community edition for free. If you want simple, good-looking traffic numbers and nothing more, Plausible is the obvious starting point.

## Fathom

Fathom is a fully managed, privacy-focused web analytics service. It is not open source, but it handles the hosting, EU data isolation, and compliance details for you, which is the whole point: zero maintenance. Pricing starts at around $15 per month for 100,000 pageviews as of July 2026, with a 7-day free trial and no free plan. Pick Fathom if you want a hands-off managed tool for website traffic and are happy to pay for someone else to run it. If the real decision is Fathom against Plausible, we compare [Plausible and Fathom side by side](/blog/plausible-vs-fathom).

## Umami

Umami is an open-source (MIT) web analytics tool built around simplicity and self-hosting. It is cookieless, lightweight, and free to run on your own server. There is also a hosted cloud with a genuine free tier (Umami's Hobby plan) and paid plans from around $20 per month as of July 2026. Umami started as a pure pageview tool, but it has since added funnel, retention, and user journey reports, so it sits a little further toward product analytics than the other web tools here. It is the natural pick for developers who want to own the whole stack and do not mind operating it, or who want a free hosted option to start with.

## Simple Analytics

Simple Analytics is a managed, EU-based (Netherlands) web analytics tool that leans hard into minimalism: no cookies, no fingerprinting, a clean dashboard, and not much to configure. It offers a free-forever plan (with a required link badge on your site) alongside paid plans from €20 per month as of July 2026. If your goal is the simplest possible privacy-friendly traffic counter, it lives up to the name.

## Privytics

Privytics is managed, cookieless product analytics with event data stored in Germany, built on the open-source OpenPanel engine (AGPL-3.0). Privytics is an independent service and is not affiliated with or endorsed by OpenPanel. The difference from everything above is scope: instead of pageviews and referrers, you get custom events, funnels, retention, cohorts, dashboards, per-user profiles, and a REST API. It is the tool for questions like "where do users drop out of onboarding?" rather than "how much traffic did this blog post get?"

The cookieless model is the rotating salted hash described earlier, so the anonymous case needs no consent banner, and cross-session identity is opt-in through `identify()` with your own user ID. The free tier is 10,000 events per month on one project, with 12-month retention and no credit card. Paid plans are stepped tiers by event volume rather than metered usage (EUR 10 per 100k, EUR 20 per 500k, EUR 40 per 1M, EUR 100 per 5M, EUR 200 per 10M, per month, ex VAT) and add session replay plus 5-year event history. Session replay is opt-in per project and masks all text and inputs by default.

Being candid: Privytics is a newer service than the names above. It is product analytics, not a lightweight pageview counter, and it starts charging once you pass 10,000 events a month. If either of those is a mismatch, one of the other tools will serve you better.

## When another tool is the better choice

- **You only want website traffic stats.** If the questions are "how many visitors, from where, to which pages," a dedicated web analytics tool (Plausible, Fathom, Umami, Simple Analytics) is simpler and cheaper than product analytics. Privytics can count pageviews too, but you would be buying a funnel-and-retention engine to answer a pageview question.
- **You must self-host and pay nothing.** Umami self-hosted is free, and Plausible has a free community edition. Privytics is a managed service (the underlying OpenPanel engine is open source and self-hostable for free, but that is a different product from the hosted Privytics).
- **You want a free hosted plan for a small site.** Umami Cloud (Hobby) and Simple Analytics both offer a free hosted tier for low volumes, and Privytics is free up to 10,000 events a month.
- **You need a long track record today.** Plausible, Fathom, Umami, and Simple Analytics have years of production use and larger communities behind them. Privytics is a newer service than any of them.
- **You depend on ad-network features.** Remarketing audiences and cross-site attribution need the cookie-based tracking that all of these tools deliberately avoid. That is a job for the ad platforms themselves.

## FAQ

### Is cookieless analytics GDPR compliant?

It makes compliance much easier but is not a magic wand. Because no cookie or device storage is used for anonymous visitors, the ePrivacy consent trigger for storing data on a device does not fire, so you typically do not need a banner for basic analytics. GDPR still governs any personal data you process, so choose a tool that minimises data and hosts in a jurisdiction you trust, and confirm your own setup with a professional if the stakes are high. Privytics stores analytics data in Germany and writes nothing to the device.

### Do I still need a cookie banner?

For anonymous analytics with a cookieless tool, generally no. You may still need a banner if other parts of your site set non-essential cookies (marketing pixels, embedded video, live chat). Cookieless analytics removes one common reason for a banner, not automatically all of them.

### Is Google Analytics cookieless?

No. GA4 uses first-party cookies by default. Google offers a "consent mode" that models missing data, but that fills gaps with estimation rather than tracking without cookies the way a purpose-built cookieless tool does; we walk through that trade-off in our guide to [alternatives to Google consent mode v2](/blog/google-consent-mode-v2-alternative). PostHog also relies on cookies and browser storage by default for its persistent IDs, although it can be configured to keep them in page memory only.

### How does it count unique visitors without cookies?

By deriving a short, one-way fingerprint from signals the server already sees (IP, user agent, and which site you are on), mixed with a secret salt that rotates daily. Same visitor, same day, same site gives the same fingerprint, so counts and sessions work. The daily rotation means the fingerprint cannot follow anyone across days, and the one-way hash means the original details cannot be recovered.

### Can cookieless analytics still track individual users?

For anonymous visitors, only within a single day and single device, by design. Once a user logs in, you can call `identify()` with your own user ID and get proper cross-session, cross-device analytics for that person, including funnels, retention, and a full profile. The anonymous experience stays cookieless; identified tracking is opt-in.

### How accurate is it compared to cookie-based analytics?

Often more accurate for headline numbers like visits and unique visitors, because nothing is blocked or declined. Where it is deliberately less precise is long-term, cross-device journeys for anonymous users, which is the trade-off you accept in exchange for not tracking people across time.

## Trying Privytics

If you want cookieless analytics that goes past pageviews into events, funnels, retention, and per-user profiles, Privytics is worth a look. It is managed, stores event data in Germany, and is built on the open-source OpenPanel engine, with the anonymous case cookieless and banner-free and identified tracking available when you need it.

The free tier is 10,000 events a month with 12-month retention and no credit card. If your needs are simpler (just website traffic), or you want a tool with years of production use behind it, one of the web analytics options above is the honest recommendation. If you do try Privytics, tell us where it falls short.
