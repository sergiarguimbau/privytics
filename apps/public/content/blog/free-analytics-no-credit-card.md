---
slug: free-analytics-no-credit-card
title: "Free analytics with no credit card (2026)"
description: "Which analytics tools have a free plan with no credit card, which only offer trials, and where each free plan stops."
date: 2026-07-22
updated: 2026-11-27
tag: Comparison
---

These analytics tools have a free plan, not just a trial: Amplitude, Google Analytics 4, Mixpanel, PostHog, Privytics, Simple Analytics and Umami Cloud. Most need no credit card to start. Plausible, Fathom, Matomo Cloud and OpenPanel Cloud only offer trials.

We make Privytics, so we also say where the others beat it.

## Free plans side by side

| Tool               | Free plan              | Cookies | History on free | Paid from   |
|--------------------|------------------------|---------|-----------------|-------------|
| Amplitude          | 2M events/mo           | Yes ¹   | 1 year          | Not listed  |
| Google Analytics 4 | ✓                      | Yes     | 2 or 14 mo ²    | On quote ⁴  |
| Mixpanel           | 1M events/mo           | Yes     | 2 years         | $140/mo     |
| PostHog            | 1M events/mo           | Yes ¹   | 1 year          | Pay per use |
| Privytics          | 10k events/mo          | None    | 12 months       | €10/mo      |
| Simple Analytics   | Unlimited page views ³ | None    | 30 days         | €20/mo      |
| Umami Cloud        | 100k events/mo         | None    | 6 months        | $20/mo      |

¹ Can be set up to run without cookies. ² Applies to explorations and funnel reports, not standard reports. ³ Under fair use, with their badge on your site. ⁴ Analytics 360, Google's paid edition. Prices excl. VAT.

Amplitude, Mixpanel, PostHog, Privytics and Simple Analytics need no card to start. Umami does not say whether its free plan needs one.

## Trials are not free plans

A trial ends; a free plan does not. These tools have no free plan, so after the trial you pay:

- Plausible: 30-day trial, no card, then from $9/mo.
- Fathom: 7-day trial, card required, then from $15/mo.
- Matomo Cloud: 21-day trial, no card, then from €22/mo.
- OpenPanel Cloud: 30-day trial, no card, then from $2.50/mo (free for approved open-source projects).

## Where each free plan stops

- Amplitude: behavioural cohorts are not included, and the next plan, Plus, asks for a card.
- Google Analytics 4: explorations are sampled above 10M events per query, and some rows are hidden when user counts are small.
- Mixpanel: you can build cohorts but not save them. Above 1M events a month, you move to the Growth plan.
- PostHog: above 1M events it bills per event, and events from identified users cost more.
- Privytics: above 10,000 events, new events pause until next month or until you upgrade. Nothing is charged, and your dashboard stays available.
- Simple Analytics: the badge must stay on your site, you get one user and up to 5 websites, and goals and funnels are paid.
- Umami Cloud: one website only. Pro covers 1M events, up to 20 websites and 2 years of history.

## When another tool fits better

- You need more free volume: Umami, Mixpanel, PostHog and Amplitude give 10 to 200 times more events.
- You want simple web analytics for several sites and can show a badge: Simple Analytics.
- Your marketing runs on Google Ads: linked to Ads, GA4 sends key events as conversions and builds remarketing audiences.
- You can run your own server and want no subscription: self-host Umami, Matomo or OpenPanel.

For a closer look at each tool, see [the best Google Analytics alternatives](/blog/best-google-analytics-alternatives-2026).

## When Privytics fits

Our free plan covers one project, with no time limit.

- You want product analytics for free: funnels, user flows, revenue tracking, custom dashboards and alerts.
- You want retention, cohorts and user profiles, for signed-in users you identify.
- You want no cookies: nothing is stored on your visitors' devices, and each visitor gets an [anonymous ID that changes every day](/blog/what-is-cookieless-analytics).
- You want analytics data stored in EU data centres in Germany.
- You want no lock-in: Privytics runs on OpenPanel, an open-source engine (AGPL-3.0), and you can export all your data at any time. We are not affiliated with OpenPanel.

## FAQ

### Do free analytics tools need a cookie banner?

Tools that set no cookies, like Privytics, Umami and Simple Analytics, generally need no banner for anonymous analytics. Amplitude, GA4, Mixpanel and PostHog set cookies by default, so in the EU they generally need consent first ([more on the banner rules](/blog/cookieless-analytics-gdpr-cookie-banner)).

### Is self-hosting really free?

The software is free, but you pay for the server and the time to run it. Self-hosted Matomo also charges for funnels and cohorts.

### What counts as an event on Privytics?

Each page view, outgoing-link click and custom event counts as one event. Properties never count extra.

### What do paid Privytics plans add?

Paid plans are fixed monthly tiers, from €10 for 100,000 events to €200 for 10M, excluding VAT. They add 5 years of history, more projects, data imports and the AI assistant.
