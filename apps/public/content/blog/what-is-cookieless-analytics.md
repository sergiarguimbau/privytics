---
slug: what-is-cookieless-analytics
title: "What is cookieless analytics? A plain-English guide"
description: "What cookieless analytics is, how it counts visitors without cookies, what changes in your numbers, and which tools do it."
date: 2026-07-22
updated: 2026-11-27
tag: Guide
---

Cookieless analytics counts visits and actions on your site or app without storing anything on the visitor's device. Because nothing is stored there, anonymous analytics generally needs no cookie banner.

We build Privytics, one of the cookieless tools below, and we say where another tool fits better.

## How it counts visitors without cookies

Each visitor gets an anonymous ID that changes every day. Three steps make that work:

1. **A visit arrives.** Like every web request, it carries the visitor's IP address and browser details.
2. **The server makes an ID.** It mixes those details, your site and a daily secret into an anonymous ID.
3. **The next day brings a new ID.** The secret has changed, so tomorrow's ID cannot be linked to today's.

![On Monday, a visit reaches the analytics server, which mixes the IP, browser and site with Monday's secret into the anonymous ID a3f9. On Tuesday, the same visitor gets the ID 7c21 from Tuesday's secret. The two IDs cannot be linked, and nothing is stored on the visitor's device.](/images/blog/cookieless-daily-id.svg)

Within a day, the same browser on the same network keeps its ID. A visitor's pages and events add up, and funnels within a visit work. Your site is part of the mix, so the same person gets a different ID on any other site.

For developers: the ID is a hash of IP address, user agent and project ID, with a secret salt that rotates at midnight UTC.

## Cookies vs cookieless

|                             | Cookie-based     | Cookieless |
|-----------------------------|------------------|------------|
| ID stored on the device     | Yes              | No         |
| EU cookie banner            | Generally needed | Often not  |
| Visitors who refuse cookies | Not measured     | Counted    |

Rules differ by country, and any other tag that stores data on the device brings the banner back. [Our cookie banner guide](/blog/cookieless-analytics-gdpr-cookie-banner) covers when you can drop it.

## What a daily ID changes in your numbers

A cookie can recognise a visitor for months. A daily ID cannot, so some numbers read differently:

- **One day:** visits and visitors are close to Google Analytics, or a bit higher, because people who would decline a banner are still counted.
- **A week or a month:** unique visitors read higher, because an anonymous visitor who returns on another day counts again.
- **Returning visitors** read lower, for the same reason.

Signed-in users are the exception. Calling `identify()` links events to your own user IDs, so one person's visits join up across days and devices. That unlocks retention, cohorts and user profiles for signed-in users you identify.

Those user IDs are personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first. [How funnels, retention and cohorts work without cookies](/blog/funnels-retention-cohorts-without-cookies) explains both kinds of ID.

## Cookieless analytics tools

These five set no cookies by default:

| Tool             | Free plan        | From   | Self-host | Retention, cohorts |
|------------------|------------------|--------|-----------|--------------------|
| Fathom           | ✗ (7-day trial)  | $15/mo | ✗         | ✗                  |
| Plausible        | ✗ (30-day trial) | $9/mo  | ✓         | ✗                  |
| Simple Analytics | ✓ (badge)        | €20/mo | ✗         | ✗                  |
| Umami Cloud      | 100k events/mo   | $20/mo | ✓         | ✓ ¹                |
| Privytics        | 10k events/mo    | €10/mo | ✗ ²       | ✓ ³                |

¹ Umami links logged-in users with `umami.identify()`. ² The engine (OpenPanel) is open source. ³ For signed-in users you identify. Prices excl. VAT.

Matomo and PostHog can also run without cookies, but only once you turn that on. Our [roundup of cookieless analytics tools](/blog/best-cookieless-analytics-tools-2026) compares them all in more detail.

## When another tool is the better choice

- **Traffic stats only.** Plausible, Fathom or Simple Analytics show visitors, pages and sources on a simple dashboard.
- **A bigger free plan.** Umami Cloud is free up to 100k events a month, ten times our free plan.
- **Hosting it yourself.** Umami is free to self-host, and Plausible offers a Community Edition.
- **Long anonymous journeys.** If people visit over several days before signing up, a cookie-based tool links those visits for anyone who accepts cookies.
- **Ad remarketing.** Google Analytics linked to Google Ads brings remarketing audiences and Ads conversions.

## When Privytics fits

- **More than page counts.** You want [product analytics](/blog/product-analytics-vs-web-analytics) without cookies: custom events, funnels and revenue.
- **A free plan to start.** 10,000 events a month for one project, with 12 months of history, no credit card and no time limit. Past that, new events pause until next month and nothing is charged.
- **A predictable bill.** Paid plans are fixed monthly tiers from €10 for 100,000 events, so a traffic spike inside your tier never changes the bill.
- **Data in Germany.** Analytics data is stored in EU data centres in Germany, with a [DPA](/dpa) on every plan, free included.

## FAQ

### Is Google Analytics cookieless?

No: Google Analytics 4 sets cookies, so in the EU it generally needs consent first. Visitors who decline are not measured, or only estimated on larger sites with [Consent Mode](/blog/google-consent-mode-v2-alternative).

### Does cookieless analytics make my site GDPR compliant?

Not on its own: GDPR still asks for a lawful basis, a privacy notice and a DPA with your analytics provider. Legitimate interests is a common basis for anonymous analytics.

### Can ad blockers still block cookieless analytics?

Yes, because blockers work from lists of script and server addresses, not cookies. Ad blockers block Privytics less often than Google Analytics, but some do; you can [route it through your own domain](/blog/ad-blockers-analytics-first-party-proxy) to recover the rest.

### Does Privytics store visitors' IP addresses?

No. The IP is used to build the daily ID and to find the visitor's country, region and city; the raw IP is not stored.
