---
slug: privytics-vs-simple-analytics
title: "Privytics vs Simple Analytics: Web and Product Analytics Compared"
description: "Privytics vs Simple Analytics on price, free plan, cookies, data location and funnels. Both are cookieless; Privytics adds retention and cohorts."
date: 2026-07-22
updated: 2026-11-27
tag: Comparison
---

Both tools are cookieless. Simple Analytics is web analytics; Privytics adds product analytics: retention, cohorts and user profiles for signed-in users you identify, plus mobile SDKs. Both have a free plan, and paid plans start at €20 a month on Simple Analytics and €10 on Privytics.

## At a glance

|                    | Privytics     | Simple Analytics      |
|--------------------|---------------|-----------------------|
| Free plan          | 10k events/mo | ✓ (badge) ¹           |
| From               | €10/mo        | €20/mo                |
| Cookies            | None          | None                  |
| Data stored in     | Germany       | EU (mainly NL)        |
| Funnels            | ✓             | Paid plan (via goals) |
| Retention, cohorts | ✓ ²           | ✗                     |
| Self-host          | ✗ ³           | ✗                     |
| Free history       | 12 months     | 30 days               |
| Mobile SDKs        | ✓             | ✗ ⁴                   |

¹ 1 user, 5 websites, unlimited page views under fair use. ² For signed-in users you identify. ³ The engine (OpenPanel) is open source. ⁴ Apps can send events through its API. Prices excl. VAT.

## Price by volume

| Monthly volume | Privytics | Simple Analytics |
|----------------|-----------|------------------|
| 100k           | €10       | €20              |
| 1M             | €40       | €60              |
| 10M            | €200      | Custom           |

Privytics counts events: page views, outgoing-link clicks and custom events. Simple Analytics counts page views; its self-serve plans stop at 2.5M, and each extra user costs €20 a month. Prices excl. VAT.

## When Simple Analytics is the better choice

- **You want several sites on a free plan.** Its free plan covers 5 websites if you show its badge; ours covers one project.
- **You only need website stats.** For a blog or a marketing site, retention and cohorts often go unused. [Product analytics vs web analytics](/blog/product-analytics-vs-web-analytics) explains the split.
- **Jurisdiction is your first criterion.** Simple Analytics says it is not subject to US law.
- **You want a long track record.** It was founded in Amsterdam in 2018 and is self-funded.

## When Privytics fits

- **You need product analytics.** Funnels, user flows and alerts come with every plan, free included.
- **You build an app.** SDKs for [React Native](/for/react-native), Swift and Kotlin, plus Node, Python and the usual web frameworks.
- **You want an open engine.** Privytics runs on OpenPanel, an open-source analytics engine (AGPL-3.0). You can export all your data and self-host the engine at any time. Privytics is independent and not affiliated with OpenPanel.

## Funnels, retention and cohorts

Both tools have multi-step funnels. On Simple Analytics they are built from goals, which need a paid plan.

The bigger difference is what happens across days. Each Privytics visitor gets an anonymous ID that changes every day; nothing is stored on the device. So anonymous funnels cover steps within one visit.

To follow people over weeks, call `identify()` when they sign in. That unlocks retention, cohorts, profiles and cross-session funnels. Simple Analytics has no retention, cohorts or user profiles.

Calling `identify()` links events to your own user IDs. That is personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first. [Funnels, retention and cohorts without cookies](/blog/funnels-retention-cohorts-without-cookies) explains anonymous and identified tracking in more detail.

## Where the data lives

Simple Analytics keeps its primary infrastructure in the Netherlands, with an infrastructure sub-processor in Germany. It uses US providers for payments and for its optional AI features.

Privytics is operated from Spain, and analytics data is stored in EU data centres in Germany. A GDPR data processing agreement ([DPA](/dpa)) is included on every plan, free included. Some supporting services are US companies working under standard contractual clauses: payments, email, error monitoring, website and dashboard hosting with script delivery, and the AI features.

## FAQ

### Do I need a cookie banner with either tool?

Often not. Neither sets cookies, and Privytics stores nothing on your visitors' devices; our [cookie banner guide](/blog/cookieless-analytics-gdpr-cookie-banner) explains when one is still needed.

### What happens if I go over the Privytics limit?

On the free plan, new events pause until next month and nothing is charged; your dashboard stays available. Paid plans are not cut off: you get a warning email and a prompt to upgrade, with no extra charge.

### Can I import my Simple Analytics data into Privytics?

No. Privytics imports from Umami, Mixpanel and Amplitude, on paid plans. You can run both tools side by side until Privytics has built up enough history.

### Do both tools have an AI assistant?

Yes. On Simple Analytics it is an optional feature; on Privytics it comes with paid plans, and every plan gets an AI-written weekly digest email.
