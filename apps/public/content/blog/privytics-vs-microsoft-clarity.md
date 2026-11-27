---
slug: privytics-vs-microsoft-clarity
title: "Microsoft Clarity Alternative: What Free Actually Costs"
description: "Microsoft Clarity is free, but Microsoft acts as data controller and EU visitors must consent. How Privytics compares as cookieless product analytics."
date: 2026-07-29
updated: 2026-11-27
tag: Comparison
---

Microsoft Clarity costs nothing and has no traffic limits. What it costs instead is control over your visitors' data:

- Microsoft acts as a data controller, not as your processor.
- Its terms let Microsoft use that data to build user profiles, including for advertising.
- Visitors from the EEA, UK and Switzerland must consent before Clarity sets cookies.

Clarity is Microsoft's free tool for session recordings and heatmaps. Privytics is product analytics: traffic, events and funnels, plus retention and cohorts for signed-in users you identify. It can run next to Clarity or replace it, depending on what you need.

## At a glance

|                    | Privytics     | Microsoft Clarity |
|--------------------|---------------|-------------------|
| Free plan          | 10k events/mo | ✓ (no limit)      |
| From               | €10/mo        | Free only         |
| Cookies            | None          | Yes (7)           |
| Data stored in     | Germany       | Not stated        |
| Retention, cohorts | ✓ ¹           | ✗                 |
| Vendor's GDPR role | Processor     | Controller        |
| Ad profiling       | None          | Yes               |

¹ For signed-in users you identify. Both have funnels. Neither offers self-hosting, though Privytics runs on the open-source OpenPanel engine. Prices excl. VAT.

## When Clarity is the better choice

- **Your budget is zero and your traffic is large.** Clarity has no traffic limits and no paid tier.
- **Most of your visitors are outside the EEA, UK and Switzerland**, the regions where Clarity enforces consent.
- **You already show a consent banner** for other tags, such as ads, so Clarity's cookies add little extra work.

## When Privytics fits

- **You want to drop the cookie banner** for your analytics.
- **You want a vendor that works only for you**, as your processor.
- **You measure users over time.** Retention and cohorts are built in; Clarity has neither.
- **Data location matters to you.** Analytics data is stored in EU data centres in Germany.

## Who controls the data

Microsoft's [Clarity FAQ](https://learn.microsoft.com/en-us/clarity/faq) describes Clarity as a data controller. A controller decides for itself what the data is used for. A processor uses it only on your instructions.

Clarity's [terms of use](https://clarity.microsoft.com/terms) let Microsoft "create user profiles for purposes that include advertising". Microsoft also documents one of Clarity's cookies, MUID, as used for advertising, among other purposes.

We act as your processor, with a GDPR data processing agreement ([DPA](/dpa)) on every plan, free included. Your data is used only to run your analytics, never for advertising, and you can export it at any time.

## Cookies and consent

[Microsoft's cookie list](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-cookies) shows seven Clarity cookies: two first-party (`_clck`, `_clsk`) and five third-party (CLID, ANONCHK, MR, MUID, SM).

If a visitor from the EEA, UK or Switzerland declines, [each page view becomes its own session](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-without-cookie-consent) and returning visitors are not recognised. A visit to three pages shows up as three one-page sessions.

Privytics sets no cookies and stores nothing on your visitors' devices, so anonymous analytics generally needs no cookie banner. Each visitor gets an anonymous ID that changes every day, so the pages of one visit stay together. Our [cookie banner guide](/blog/cookieless-analytics-gdpr-cookie-banner) explains when you still need one.

Like Clarity without consent, we do not recognise an anonymous visitor on a later day. Signed-in users you identify are counted once across days and devices. [Funnels, retention and cohorts without cookies](/blog/funnels-retention-cohorts-without-cookies) explains how both layers work.

## FAQ

### Can I use Privytics and Clarity together?

Yes, both scripts can run on the same site. Clarity still needs consent from visitors in the EEA, UK and Switzerland, so your banner stays for Clarity.

### What does the Privytics free plan include?

10,000 events a month for one project, with 12 months of history, no credit card and no time limit. If you go over, new events pause until next month and nothing is charged.

### What counts as an event in Privytics?

Each page view, outgoing-link click and custom event counts as one event. Properties never count extra.

### Can I import my Clarity data into Privytics?

No. Privytics imports from Umami, Mixpanel and Amplitude, on paid plans. You start collecting from the day you add the script.
