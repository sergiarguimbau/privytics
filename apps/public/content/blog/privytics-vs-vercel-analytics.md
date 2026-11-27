---
slug: privytics-vs-vercel-analytics
title: "Vercel Web Analytics Alternative: The Real Cost"
description: "Privytics vs Vercel Web Analytics: cost by volume, what each Vercel plan includes, and when funnels and retention are worth switching for."
date: 2026-07-29
updated: 2026-11-27
tag: Comparison
---

Vercel Web Analytics costs less than Privytics up to roughly 3 to 4 million events a month, because Pro bills $3 per 100,000 events. Privytics is the alternative when you need more than traffic stats: funnels, plus retention, cohorts and user profiles for signed-in users you identify.

|                    | Privytics             | Vercel          |
|--------------------|-----------------------|-----------------|
| Free plan          | 10k events/mo         | 50k events/mo ¹ |
| From               | €10/mo                | $20/mo + usage  |
| Data stored in     | Germany               | Not documented  |
| Funnels            | ✓                     | ✗               |
| Retention, cohorts | ✓ ²                   | ✗               |
| History            | 12 mo free, 5 yr paid | 1 to 24 mo ³    |
| Built for          | Any site or app       | Sites on Vercel |

¹ Hobby plan: personal, non-commercial use only.
² For signed-in users you identify.
³ 1 month on Hobby, 12 on Pro, 24 with the Plus add-on.

Both set no cookies. Neither can be self-hosted, but Privytics runs on OpenPanel, an open-source engine you can host yourself. Prices excl. VAT.

| Events/month | Privytics | Vercel Pro usage |
|--------------|-----------|------------------|
| 100k         | €10       | $3               |
| 1M           | €40       | $30              |
| 5M           | €100      | $150             |
| 10M          | €200      | $300             |

Vercel figures exclude the $20/mo Pro fee, whose $20 credit may cover part of them. After 1M, Privytics' next tier is €100, so Vercel stays cheaper at 2M ($60). Prices excl. VAT.

## When Vercel Web Analytics is the better choice

- Your site runs on Vercel and traffic stats are all you need.
- Your project is personal and fits in 50,000 events a month: Hobby is free.
- You want analytics in the dashboard and on the bill you already have.
- Your volume stays below a few million events a month, where Vercel's usage costs less.

## When Privytics fits

- You need funnels, or retention and cohorts for your signed-in users.
- You want custom events on every plan, free included.
- You want one tool for any site or app, with SDKs for web, mobile and server.
- You want a clear answer on location: analytics data is stored in EU data centres in Germany.
- You pass 5 million events a month: fixed tiers cost less, and a traffic spike inside your tier never changes the bill.

## What Vercel's plans include

Vercel prices Web Analytics inside its hosting plans ([limits and pricing](https://vercel.com/docs/analytics/limits-and-pricing)):

- **Hobby:** free, 50,000 events a month, for personal and non-commercial use only. No custom events.
- **Pro:** $20 a month, with one deploying seat and $20 of usage credit. No events are included, and that credit also pays for the rest of your Vercel usage.
- **Web Analytics Plus:** $10 a month per team. It raises custom events from 2 properties to 8 and adds UTM parameters.

Two properties cover a simple event, such as a signup with its method and plan. Richer events need the Plus add-on; our [event naming guide](/blog/analytics-tracking-plan-event-naming) shows how to plan them.

Going over a free plan pauses collection on both. Vercel's Hobby gives a 3-day grace period, then stops collecting and waits 7 days before it resumes. On Privytics' free plan, new events pause until next month and nothing is charged; your dashboard stays available.

## Same daily visitor ID, plus one optional step

Both tools give each visitor an anonymous ID that changes every day. Neither can tell that Monday's visitor came back on Tuesday.

For developers: Privytics hashes the IP address, user agent and project ID with a secret salt that rotates at midnight UTC. Vercel builds its hash from the incoming request.

Privytics adds one optional step. Call `identify()` with your own user ID after sign-in, and that person's visits link up across days and devices. This unlocks retention, cohorts, user profiles and cross-session funnels.

Those user IDs are personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first. We explain both layers in [funnels, retention and cohorts without cookies](/blog/funnels-retention-cohorts-without-cookies).

## FAQ

### Does Privytics work on a site hosted on Vercel?

Yes. It installs as a script or SDK on any host, and the [Next.js guide](/for/nextjs) shows the setup. You can also keep Vercel Web Analytics for traffic and add Privytics for product questions.

### Can I export my raw data from either tool?

Vercel sends raw page views and events through Drains on Pro and Enterprise, at $0.50 per GB. Privytics includes raw data export and a query API on every plan, free included.

### Can I move my Vercel Web Analytics history to Privytics?

No. Imports on paid plans cover Umami, Mixpanel and Amplitude, so your Privytics history starts the day you add the script.

### What happens if a paid Privytics plan goes over its tier?

Paid plans are not cut off at their tier limit: you get a warning email and a prompt to upgrade, with no extra charge.
