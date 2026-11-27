---
slug: google-consent-mode-v2-alternative
title: "Google Consent Mode v2: do you still need it?"
description: "What Google Consent Mode v2 does, what Google still receives when visitors decline, when you need it, and the cookieless alternative."
date: 2026-07-29
updated: 2026-11-27
tag: Compliance
---

You need Consent Mode v2 only if you run personalised Google Ads or remarketing for visitors in the EEA, UK or Switzerland. To measure your own site or product, you don't: cookieless analytics counts anonymous visitors without any consent signal.

## What Consent Mode v2 does

Consent Mode is a signal, not consent. Your banner still asks the question, and in the EU, GA4 still needs consent before it sets cookies. Consent Mode passes the answer on to Google's tags, which then collect more or less.

In code, you set defaults with `gtag('consent', 'default', ...)` before anything is measured. Then you send the visitor's choice with `gtag('consent', 'update', ...)`.

It works with four signals:

| Signal | Covers | If denied |
| --- | --- | --- |
| `ad_storage` | Ad cookies | Not set or read |
| `analytics_storage` | Analytics cookies | Cookieless pings ¹ |
| `ad_user_data` ² | User data for ads | Not sent |
| `ad_personalization` ² | Personalised ads | Off |

¹ In advanced mode only. ² New in v2.

## Basic or advanced mode

The two setups differ in what Google receives when a visitor declines:

- **Basic:** tags wait for the visitor's choice. If they decline, nothing is sent.
- **Advanced:** tags load on every page, with defaults set to denied. If the visitor declines, Google still gets cookieless pings.

Each ping carries the consent choice, a timestamp, the user agent, the referrer, an ad-click flag and a random number. So in advanced mode, "declined" does not mean nothing happens. Whether that is acceptable is a call for your DPO, not your ad agency.

## What happens to visitors who decline

![Three lanes. GA4 with Consent Mode, visitor accepts: cookies stored, measured. Visitor rejects: nothing stored, not measured or only estimated. Cookieless analytics: nothing stored, counted.](/images/blog/consent-mode-v2-three-lanes.svg)

With GA4, visitors who decline are not measured, or only estimated on larger sites. GA4 estimates them only in advanced mode, and only above two thresholds:

- 1,000+ events a day with `analytics_storage` denied, for 7 days
- 1,000+ daily users with it granted, on 7 of the previous 28 days

Meeting both still does not guarantee an estimate. And modelled data never reaches retention reports, cohort explorations, audiences, the user explorer, predictive metrics or the BigQuery export.

So in GA4, retention and cohorts only cover visitors who accepted.

## The cookieless alternative

Cookieless analytics stores nothing on the visitor's device, which removes the usual trigger for the banner rule. So anonymous analytics [generally needs no cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner), and there is no consent signal to send.

That is how we built Privytics: each visitor gets an anonymous ID that changes every day. For developers: the ID is a hash of IP address, user agent and project ID, with a secret salt that rotates at midnight UTC.

|                        | GA4 + Consent Mode | Privytics         |
| ---------------------- | ------------------ | ----------------- |
| Cookies                | Yes                | None              |
| Banner for analytics   | Needed ¹           | Often not         |
| Visitors who decline   | Estimated ²        | Counted ³         |
| Retention, cohorts     | Consented users    | Signed-in users ⁴ |
| Google Ads remarketing | ✓                  | ✗                 |
| Data stored in         | Google's servers   | Germany           |
| Setup                  | Banner + 4 signals | Script or SDK     |

¹ In the EU, GA4 needs consent before it sets cookies. ² Only above the modelling thresholds; otherwise not measured. ³ Ad blockers block Privytics less often than Google Analytics, but some do. ⁴ For signed-in users you identify; anonymous visitors are not linked across days.

Whether GA4 itself is lawful in the EU is a separate question, covered in [is Google Analytics legal in the EU](/blog/is-google-analytics-legal-eu-2026).

## When GA4 with Consent Mode is the better choice

- Ad spend drives your growth and you need Google Ads attribution. We have no Google Ads integration.
- You upload Customer Match lists for EEA users. Both `ad_user_data` and `ad_personalization` must be granted.
- You keep GA4 linked to Google Ads. Consent Mode is now the only control over the Google Ads cookies and IDs that Analytics collects.
- Your site is busy enough for GA4 to estimate the visitors who decline.

## When Privytics fits

- You don't buy Google Ads, so Consent Mode solves a problem you don't have.
- You want visitors who would decline a banner counted, on a site of any size.
- You need funnels, plus retention and cohorts for signed-in users you identify.
- You want analytics data stored in EU data centres in Germany.
- You want a free start: 10,000 events a month for one project, with 12 months of history, no credit card and no time limit.

## Switching from GA4

1. **Decide what you need Google for.** If you don't buy Google Ads, the answer is often nothing. If you do, keep GA4 for the ads and measure your site with Privytics.
2. **Run both for a few weeks.** Expect higher numbers on the cookieless side: visitors who decline are counted, and an anonymous visitor who returns on another day counts again.
3. **Trim the banner.** Any other tag that stores data on the device brings the banner back, so check them all.

The step-by-step version is in [migrating from GA4 to cookieless analytics](/blog/migrate-from-google-analytics-ga4-cookieless).

## FAQ

### Is Google Consent Mode v2 a legal requirement?

No. It is Google's own requirement for its advertising features, not a law.

### Does Consent Mode v2 make Google Analytics cookieless?

No: GA4 still sets cookies when a visitor accepts, and Consent Mode only changes what its tags do when a visitor declines. For the difference, see [what is cookieless analytics](/blog/what-is-cookieless-analytics).

### Do AdSense publishers need a consent platform?

Yes, for personalised ads. AdSense, Ad Manager and AdMob need a Google-certified consent platform integrated with the TCF in the EEA, the UK and Switzerland.

### Does identify() in Privytics need consent?

It can: `identify()` links events to your own user IDs, which is personal data, and the lawful basis you choose is often consent. Built-in consent gating lets you ask first: start with `disabled: true`, then call `op.ready()` after consent.
