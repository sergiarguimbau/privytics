---
slug: privytics-vs-umami
title: "Privytics vs Umami: managed EU analytics vs free self-hosting"
description: "Privytics vs Umami compared: price, how events are counted, where your data is stored, and when self-hosting Umami is the better call."
date: 2026-07-19
updated: 2026-11-27
tag: Comparison
---

Pick Umami if you want a lower price or a free analytics tool you host yourself. Pick Privytics if you want analytics data stored in Germany on every account, no overage fees and longer history.

## Side by side

|                | Privytics             | Umami Cloud               |
|----------------|-----------------------|---------------------------|
| Free plan      | 10k events/mo         | 100k events/mo            |
| From           | €10/mo                | $20/mo                    |
| Data stored in | Germany               | US or EU                  |
| Self-host      | ✗ ¹                   | ✓                         |
| History        | 12 mo free, 5 yr paid | 6 mo free, 2 to 5 yr paid |
| Over the limit | No extra charge       | Per-event fee ²           |

¹ The engine (OpenPanel) is open source. ² On Pro and Business. Both set no cookies. Both include funnels and retention on every plan, free included; in Privytics, retention is for signed-in users you identify. Prices excl. VAT.

Monthly cost by volume:

| Events a month | Privytics | Umami Cloud |
|----------------|-----------|-------------|
| 100k           | €10       | Free        |
| 1M             | €40       | $20         |
| 10M            | €200      | $200        |

Umami prices from [umami.is/pricing](https://umami.is/pricing). Prices excl. VAT.

## When Umami is the better choice

- **You want to self-host.** Umami is open source (MIT), with no licence fee when you host it yourself.
- **Your site fits the free plan.** Hobby covers 100k events a month, one website and 6 months of history.
- **You want a lower price per event.** Pro is $20 for 1M events and covers up to 20 websites.

## When Privytics fits

- **You want analytics data in Germany** on every account, with no region to choose.
- **You want a predictable bill.** A traffic spike inside your tier never changes it.
- **You want longer history:** 12 months free, 5 years on every paid plan from €10.
- **You track apps and servers too.** SDKs cover web, React Native, Swift, Kotlin, Node, Python, Ruby, Rust and Java.

## How events are counted and billed

The units differ, so check them against your own tracking before you compare prices:

- **Privytics:** each page view, outgoing-link click and custom event is one event. Properties never count extra.
- **Umami:** each saved event property counts as one more event. A purchase event with three properties uses four.

Going over the limit works differently too:

- **Umami:** paid plans charge for each extra event, $0.00003 on Pro and $0.00002 on Business.
- **Privytics, free plan:** new events pause until next month and nothing is charged. Your dashboard stays available.
- **Privytics, paid plans:** you get a warning email and a prompt to upgrade, with no extra charge.

## Self-hosting and where your data lives

If you self-host Umami, budget for the server and the time to update and back it up.

Privytics runs on OpenPanel, an open-source analytics engine (AGPL-3.0). We are an independent service, not affiliated with OpenPanel.

You track with the standard OpenPanel SDKs and can export all your data. That means you can self-host the engine or [move to OpenPanel's own cloud](/blog/privytics-vs-openpanel) at any time.

On Umami Cloud, you [choose a US or EU region](https://docs.umami.is/docs/cloud/faq) at sign-up, and that choice covers analytics storage. With Privytics there is nothing to choose: analytics data is stored in EU data centres in Germany for every account. Some supporting services, such as payments and email, are US companies under standard contractual clauses, and our [privacy policy](/privacy) lists each one.

## FAQ

### Can I import my Umami data into Privytics?

Yes, on paid plans. Privytics imports Umami data from an export file.

### Do I need a cookie banner with either tool?

Often not. Cookieless, anonymous analytics generally needs no cookie banner, though rules differ by country ([more on the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner)).

### Can both tools follow signed-in users across visits?

Yes: Umami links logged-in users with `umami.identify()`, and Privytics does it with `identify()`. Anonymous Privytics visitors get an ID that changes every day, and nothing is stored on the device.

### Do both offer a data processing agreement?

Yes: Umami publishes a DPA and a list of sub-processors, and Privytics includes a [DPA](/dpa) on every plan, free included.
