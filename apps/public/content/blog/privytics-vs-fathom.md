---
slug: privytics-vs-fathom
title: "Privytics vs Fathom Analytics: Pricing, Privacy and Features"
description: Privytics vs Fathom Analytics compared on price, free plan, cookies, data location and funnels. Fathom covers traffic; Privytics adds product analytics.
date: 2026-07-19
updated: 2026-11-27
tag: Comparison
---

Pick Fathom for simple, cookieless traffic stats; it has a 7-day trial and no free plan. Pick Privytics, also cookieless, for a permanent free plan and product analytics: funnels, plus retention, cohorts and user profiles for signed-in users you identify.

## At a glance

|                    | Privytics             | Fathom          |
|--------------------|-----------------------|-----------------|
| Free plan          | 10k events/mo         | ✗ (7-day trial) |
| From               | €10/mo                | $15/mo          |
| Data stored in     | Germany               | US ³            |
| Funnels            | ✓                     | ✗               |
| Retention, cohorts | ✓ ¹                   | ✗               |
| Self-host          | ✗ ²                   | ✗               |
| Sites              | 1 free, more paid     | 50+             |
| History            | 12 mo free, 5 yr paid | Unlimited ⁴     |

¹ For signed-in users you identify. ² The engine (OpenPanel) is open source. ³ EU visitors' IP addresses are removed on EU servers; the anonymised data is stored in the US. ⁴ While you are a customer. Both set no cookies and track custom events and revenue. Prices excl. VAT.

## Price by volume

| Monthly volume | Privytics | Fathom |
|----------------|-----------|--------|
| 100k           | €10       | $15    |
| 1M             | €40       | $60    |
| 10M            | €200      | $200   |

Both count each page view and custom event as one; Privytics also counts outgoing-link clicks. Fathom gives two months free on yearly billing. Prices excl. VAT.

## When Fathom is the better choice

- **You only need traffic stats.** For a blog or marketing site, Fathom covers page views, UTM campaigns, custom events and revenue. If your shortlist is Fathom and Plausible, see [Plausible vs Fathom](/blog/plausible-vs-fathom).
- **You run many sites.** Every plan includes at least 50 sites, and more come in packs of 50 for $10 a month.
- **You want to keep data for more than 5 years.** Fathom sets no history limit.

## When Privytics fits

- **You want a free plan.** 10,000 events a month for one project, with no credit card and no time limit. Fathom's trial lasts 7 days and asks for a card up front.
- **You need product analytics.** Funnels, user flows and alerts, plus retention and cohorts for the users you identify.
- **Data location matters to you.** Analytics data is stored in EU data centres in Germany, and a GDPR [DPA](/dpa) is included on every plan.
- **You want an open engine.** Privytics runs on OpenPanel, an open-source analytics engine (AGPL-3.0). You can export all your data and self-host the engine at any time.

## Funnels, retention and cohorts

Privytics shows funnels for anonymous visitors too, as long as the steps happen within one visit. Not sure you need this? Read [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics).

Each visitor gets an anonymous ID that changes every day; nothing is stored on the device. To follow people across days, with retention, cohorts, profiles and cross-session funnels, you call `identify()` when they sign in.

Calling `identify()` links events to your own user IDs. That is personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first. [Funnels, retention and cohorts without cookies](/blog/funnels-retention-cohorts-without-cookies) explains both layers.

## FAQ

### Can I import my Fathom data into Privytics?

No. Privytics imports only from Umami, Mixpanel and Amplitude, on paid plans. You can run both tools side by side until Privytics has built up enough history.

### What happens if I go over the Privytics limit?

On the free plan, new events pause until next month and nothing is charged; your dashboard stays available. Paid plans are not cut off: you get a warning email and a prompt to upgrade, with no extra charge.

### Do I need a cookie banner with either tool?

Often not. Neither sets cookies, and Privytics stores nothing on your visitors' devices; our [cookie banner guide](/blog/cookieless-analytics-gdpr-cookie-banner) explains when one is still needed.

### Is Fathom open source?

Not the current product. Its old version, Fathom Lite, is MIT-licensed and self-hostable, but it uses cookies and only gets maintenance.
