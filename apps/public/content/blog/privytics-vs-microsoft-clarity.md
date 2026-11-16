---
slug: privytics-vs-microsoft-clarity
title: "Microsoft Clarity Alternative: What Free Actually Costs"
description: Microsoft Clarity alternative: Clarity is free with no traffic limits, but Microsoft may profile your visitors for ads. The honest trade-offs, July 2026.
date: 2026-07-29
updated: 2026-07-29
tag: Comparison
---

Most people looking for a Microsoft Clarity alternative are not looking for cheaper. Clarity is genuinely free forever, with no traffic limits and no upsell, and nothing below changes that. What they want is a tool where the vendor is not also an advertising company, where visitor data sits under a processor agreement rather than Microsoft's own terms, and where the EU consent story is simpler. Privytics is a cookieless alternative on those axes: no cookies, no banner requirement for anonymous analytics, EU-only storage, and your data used only for your analytics. It does not do heatmaps, and it is not free at Clarity's scale.

*Clarity details checked against Microsoft's documentation on 2026-07-29. Verify before deciding. Not legal advice.*

## What Clarity is, and what it is not

Microsoft's FAQ lists Clarity's supported features as session recordings, heatmaps and ML insights. The documentation adds funnels, smart events, segments, [30 or more filters](https://learn.microsoft.com/en-us/clarity/clarity-filters), frustration signals such as rage clicks and quick backs, a Google Analytics integration, and a JavaScript API for custom identifiers, tags and events.

For the price that is a strong offer: if you want to watch someone get stuck in your checkout, Clarity does it well and costs nothing.

What it is not is a product analytics stack. Retention curves and cohort analysis are not in the documented feature set; the reporting model is built around sessions and page behaviour rather than users over time. If that split is new to you, see [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics).

Two limits are worth knowing. [Playback data is retained for 30 days](https://learn.microsoft.com/en-us/clarity/setup-and-installation/data-retention), click data and labelled or favourited sessions for 9 months. And Clarity records up to 100,000 sessions per project per day. Neither bites most sites, but the 30-day playback window catches people out.

## The part that is not free

Microsoft's FAQ states that Clarity is GDPR compliant **as a data controller**. That one word is the whole article. A processor uses your data only on your instructions. A controller decides for itself what the data is for.

Clarity's terms of use set out that Microsoft may use the personal data it collects in accordance with the Microsoft Privacy Statement, including to improve its products and to "create user profiles for purposes that include advertising". [Read the terms yourself](https://clarity.microsoft.com/terms). That clause is why the product can be free at petabyte scale.

Microsoft is not hiding it. Its sample privacy policy wording for site owners names Microsoft Advertising alongside Clarity. The link is structural too: Clarity can be switched on from a Microsoft Advertising UET tag, and the MUID cookie it sets is described as used for advertising, site analytics and other operational purposes.

## Is Microsoft Clarity cookieless? No

This gets misreported, so here is the documented answer. [Microsoft's cookie list](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-cookies) states that Clarity's typical usage requires non-essential cookies on your visitor's browser, storing a unique pseudonymous ID: `_clck` and `_clsk` first-party, plus CLID, ANONCHK, MR, MUID and SM third-party. CLID identifies the first time Clarity saw a user on any site using Clarity, which is cross-site by definition.

Since 31 October 2025, Clarity enforces consent signal requirements for visits from the EEA, UK and Switzerland. Consent Mode is on by default there, and Clarity waits for a valid signal before setting cookies, passed via a supported consent platform or the Clarity Consent API. Without consent the tag still loads and collects cookieless data, but [every pageview becomes its own session](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-without-cookie-consent): pages per session drops to 1, multi-step funnels show a full drop-off, quick backs record as 0, and no visitor counts as returning.

So for EU traffic Clarity is a consent-gated tool: a banner, a wired-up signal, and flattened data from everyone who declines. It is simply a different shape from cookieless.

Privytics sets no cookies and writes nothing to the device. The anonymous visitor id is a daily rotating salted hash of IP, user agent and project id, the salt rotating at midnight UTC, so there is no persistent identifier to consent to. Mechanics in [what is cookieless analytics](/blog/what-is-cookieless-analytics), banner reasoning in [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

Replay is a separate and harder question, covered in [GDPR and session replay consent](/blog/gdpr-session-replay-consent). Privytics replay is opt-in per project, paid only, and masks all text and inputs by default. Clarity's default masking mode is Balanced, which masks numbers and email addresses; Strict masks everything but is not the default.

## Privytics vs Microsoft Clarity side by side

| Attribute | Privytics | Microsoft Clarity |
| --- | --- | --- |
| Category | Product analytics | Behavioural analytics: replay, heatmaps, funnels |
| Price | Free 10,000 events/month; paid from EUR 10/month for 100k (excl. VAT) | Free forever, no traffic limits, no paid tier |
| Cookies | None | `_clck`, `_clsk` first-party plus CLID, ANONCHK, MR, MUID, SM third-party |
| Visitor ID | Daily rotating salted hash of IP + user agent + project id | Pseudonymous ID stored in cookies |
| EU consent | Generally not required for anonymous analytics | Required. Enforced for EEA, UK and CH since 31 Oct 2025 |
| Controller role | You are controller, we are your processor, [DPA here](/dpa) | Microsoft states it is GDPR compliant as a data controller |
| Data location | EU data centres in Germany | Azure. EU customers contract with Microsoft Ireland, with SCCs covering transfers to Microsoft Corporation in the US |
| Vendor's own use of visitor data | Analytics for you only | Terms permit Microsoft's own purposes, including user profiles for advertising |
| Session replay | Paid, opt-in per project, all text and inputs masked by default | Included free. Default masking mode is Balanced |
| Heatmaps | No | Yes |
| Retention curves and cohorts | Yes | Not in the documented feature set |
| Data retention | 12 months free, 5 years paid | Playback 30 days; click data and labelled sessions 9 months |
| Deleting one user's data | No persistent visitor record to delete; where you use `identify()`, that user's data can be deleted on request | Microsoft states you must delete the entire project |
| Under-18 audiences | No stated restriction | Microsoft states Clarity should not be used on sites targeting under-18s |

*Prices as of July 2026. Clarity has no paid tier.*

## Who should just use Clarity

- **You want heatmaps.** Privytics has none. Clarity's are free and good.
- **Your budget is zero and your traffic is large.** Traffic is genuinely unlimited and it costs nothing. Recordings are capped at 100,000 sessions per project per day.
- **You already run Microsoft Advertising.** The UET integration gives code-free conversion tracking.
- **Your audience is outside the EEA, UK and Switzerland.** Consent enforcement is regional, so the friction mostly disappears.
- **You are diagnosing UX, not measuring a product.** Rage clicks and quick backs beat any funnel chart at "why is this page confusing".

Worth stating plainly: Clarity is a Microsoft product running on a very large number of sites, and Privytics is a newer service.

## Who should not

- **You cannot accept your visitors being profiled for advertising.** No setting fixes this. It is the honest dealbreaker.
- **You want to drop the cookie banner.** Clarity needs a banner and a wired-up consent signal for EEA, UK and Swiss visitors.
- **You need a short EU data chain.** Clarity data sits in Azure, with EU customers contracting with Microsoft Ireland and SCCs covering transfers to the US entity. Lawful, but longer than "stored in Germany".
- **You need retention, cohorts or user-level analysis.** A scope mismatch, not a criticism.
- **You need per-user deletion, or replay older than 30 days.** Neither is on offer.

## FAQ

### Is Microsoft Clarity really free?

Yes. Microsoft states Clarity is free forever, with no traffic limits and no obligation to upgrade. There is no paid tier. The cost sits in the data terms, not the invoice.

### Does Microsoft Clarity use cookies?

Yes. Microsoft documents `_clck` and `_clsk` as first-party plus CLID, ANONCHK, MR, MUID and SM as third-party, all non-essential cookies storing a pseudonymous ID. Clarity is not a cookieless tool.

### Do I need a cookie banner for Microsoft Clarity?

For visitors from the EEA, UK and Switzerland, yes. Since 31 October 2025 Clarity enforces consent signal requirements in those regions, and Consent Mode is on by default. Consent must reach Clarity through a supported consent platform or the Consent API before cookies are set.

### Does Microsoft use my visitors' data for advertising?

Clarity's terms of use permit Microsoft to use the personal data collected in accordance with the Microsoft Privacy Statement, including to create user profiles for purposes that include advertising. Its sample privacy policy wording for site owners names Microsoft Advertising. [Check the terms directly](https://clarity.microsoft.com/terms).

### How long does Microsoft Clarity keep data?

Playback data for 30 days, click data and labelled or favourited sessions for 9 months. Microsoft states that after the retention period data is deleted from its servers including backups and cannot be recovered.

### What is the closest privacy-first alternative to Clarity?

It depends which half of Clarity you use. For heatmaps there is no direct cookieless equivalent. For session replay plus product analytics under a processor agreement with EU-only storage, Privytics covers that ground.

## Trying Privytics

Privytics is cookieless product analytics: events, funnels, retention, cohorts, dashboards and opt-in session replay, built on the open-source OpenPanel engine (AGPL-3.0), independent and not affiliated with or endorsed by OpenPanel. Analytics event data is stored in EU data centres in Germany. You are the controller, we are your processor, [DPA here](/dpa).

The free tier is 10,000 events a month on one project, 12 months of retention, no credit card. Paid starts at EUR 10 a month for 100,000 events, excluding VAT, and adds session replay plus five-year event history.

If you need a free heatmap tool and your visitors are outside the EU, keep using Clarity. If the advertising clause is what stopped you, that is what this article was for.
