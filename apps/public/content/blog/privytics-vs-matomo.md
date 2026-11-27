---
slug: privytics-vs-matomo
title: "Privytics vs Matomo: Pricing, Cookies and EU Hosting Compared"
description: "Privytics vs Matomo: prices from 100k to 10M, what each one counts, cookies, self-hosting, and when each tool is the better choice."
date: 2026-07-19
updated: 2026-11-27
tag: Comparison
---

Pick Matomo if you need a full Google Analytics replacement with ecommerce reports, or want to run analytics on your own servers. Pick Privytics if you want analytics without cookies, a free plan with no time limit and a lower monthly price. We make Privytics, so we also say where Matomo is the better choice.

## Side by side

|                    | Privytics             | Matomo Cloud     |
|--------------------|-----------------------|------------------|
| Free plan          | 10k events/mo         | ✗ (21-day trial) |
| From               | €10/mo                | €22/mo           |
| Cookies            | None                  | Yes (3) ¹        |
| Funnels            | ✓                     | ✓ ²              |
| Retention, cohorts | ✓ ³                   | Cohorts ✓ ²      |
| Self-host          | ✗ ⁴                   | ✓                |
| Ecommerce reports  | ✗ ⁵                   | ✓                |
| History            | 12 mo free, 5 yr paid | 24 mo raw ⁶      |

¹ Cookieless is an opt-in setting. ² Included in Cloud; paid plugins when self-hosted. ³ For signed-in users you identify. ⁴ The engine (OpenPanel) is open source. ⁵ Revenue tracking is included on every Privytics plan. ⁶ Reports are kept forever. Prices excl. VAT.

Both store analytics data in EU data centres in Germany. Matomo is run by InnoCraft, a New Zealand company, and Privytics is operated from Spain.

Price per month at the same volume:

| Volume | Privytics (events) | Matomo Cloud (hits) |
|--------|--------------------|---------------------|
| 100k   | €10                | €38                 |
| 1M     | €40                | €172                |
| 10M    | €200               | Contact sales       |

Prices excl. VAT.

## When Matomo is the better choice

- You need ecommerce and site-search reports.
- You want to host it yourself: Matomo's core is free and open source (GPL), with no traffic limit.
- You are leaving Google Analytics and want to bring your history: Matomo has a Google Analytics importer.
- You need a security certification: Matomo is ISO 27001:2022 certified.
- You manage many sites: Cloud Business includes 30 websites and 30 team members.

## When Privytics fits

- You want a free plan, not a trial: 10,000 events a month for one project, no card.
- You want no cookies by default, with nothing to configure.
- You want to pay less: Privytics costs under a third of Matomo Cloud at 100k and 1M.
- You want no surprise charges when your traffic spikes.

## What counts, and what happens when you go over

Both tools bill by tracked actions, not just page views. Matomo counts a hit for each page view, event, download, outlink or site search. Privytics counts an event for each page view, outgoing-link click and custom event, and properties never count extra.

Going over your plan works differently:

- Matomo Cloud bills extra hits in blocks of 10% of your plan's hits, each at 10% of the plan's price.
- On the Privytics free plan, new events pause until next month. Nothing is charged, and your dashboard stays available.
- Privytics paid plans are not cut off at their limit. You get a warning email and a prompt to upgrade, with no extra charge.

## Cookies and consent

Matomo sets three cookies by default: `_pk_id` (13 months), `_pk_ses` (30 minutes) and `_pk_ref` (6 months).

Privytics sets no cookies and stores nothing on your visitors' devices. Each visitor gets an anonymous ID that changes every day. For developers: the ID is a hash of IP address, user agent and project ID, with a secret salt that rotates at midnight UTC.

So anonymous analytics with Privytics generally needs no cookie banner ([when you still need one](/blog/cookieless-analytics-gdpr-cookie-banner)). In Germany, Matomo's own [consent guide](https://matomo.org/faq/new-to-piwik/configure-matomo-analytics-for-tdddg-ttdsg-compliance/) recommends asking even without cookies, and that caution applies to Privytics too.

To ask first, start Privytics with `disabled: true` and call `op.ready()` after consent. A [DPA](/dpa) is included on every Privytics plan, free included.

The trade-off of a daily ID: an anonymous visitor who returns on another day counts again. Signed-in users you identify are counted once across days, and that is what retention and cohorts rely on ([how it works](/blog/funnels-retention-cohorts-without-cookies)).

## FAQ

### What does self-hosted Matomo cost?

The software is free, but funnels, cohorts and A/B tests are paid plugins. The Team bundle (€275/mo, 4 users) includes funnels; cohorts start with the Business bundle at €1,450/mo.

### Is Matomo Cloud cheaper if I pay yearly?

Yes. Paying yearly gives two months free, so the 50,000-hit plan costs €220 a year instead of €264, excl. VAT.

### Can I import my Matomo data into Privytics?

No. Privytics imports from Umami, Mixpanel and Amplitude on paid plans, so your Privytics data starts on the day you switch.

### Can I leave Privytics later?

Yes: Privytics runs on OpenPanel, an open-source engine (AGPL-3.0). You can export all your data, then self-host the engine or move to OpenPanel's own cloud.
