---
slug: google-consent-mode-v2-alternative
title: "Google Consent Mode v2: do you still need it?"
description: "Google Consent Mode v2 explained: what it does, what data still flows when consent is denied, when you actually need it, and the cookieless alternative."
date: 2026-07-29
updated: 2026-07-29
tag: Compliance
---

Google Consent Mode v2 is a signalling layer, not a consent banner. It tells Google's tags which consent signals a visitor granted, so those tags can adjust what they collect. You need it if you buy Google Ads and want personalised advertising, remarketing or their measurement for EEA, UK or Swiss traffic, and you do not need it to measure your own site or product, because a cookieless analytics tool counts anonymous visitors without any consent signal at all.

*Google mechanics checked against Google's own documentation on 2026-07-29. Dates and settings change, so verify before acting. General information, not legal advice.*

## What Consent Mode v2 actually is

Consent mode lets you communicate a user's cookie or app identifier consent status to Google, and Google tags adjust their behaviour accordingly. You set placeholder values with `gtag('consent', 'default', ...)` before anything is measured, then reflect the user's real choice with `gtag('consent', 'update', ...)`.

Version 2 added two advertising signals, `ad_user_data` and `ad_personalization`, to the consent types that already existed. The four that matter:

| Signal | What it controls | Behaviour when denied |
| --- | --- | --- |
| `ad_storage` | Storage (cookies) for advertising | No new advertising cookies written, existing ones not read, IP addresses truncated |
| `analytics_storage` | Storage related to analytics | Analytics cookies not read or written, cookieless pings sent instead |
| `ad_user_data` | Sending user data related to advertising to Google | Personal data collection for online advertising disabled, including `user_id` and enhanced conversions |
| `ad_personalization` | Personalised advertising | Personalised ads disabled across Google's advertising platforms |

The key point: consent mode does not collect consent, it transmits it. You still need a banner or a consent management platform to ask the question, and a lawful basis. Consent mode is the plumbing between the two.

## Basic versus advanced implementation

This distinction changes what Google actually receives.

| Aspect | Basic | Advanced |
| --- | --- | --- |
| When tags load | Blocked until the user interacts with the banner | Loaded on every page, defaults set to denied |
| Data sent when denied | None at all, not even the consent status | Consent state plus cookieless pings |
| Modelling quality | General model, less detailed | Advertiser-specific model, more detailed |
| GA4 behavioural modelling | Not available | Available if thresholds are met |

Google's instruction is blunt: load tags in all cases, not only if the user consents. That is the price of modelling.

## What still flows in the denied state

If you run advanced mode and a visitor declines, Google still receives a cookieless ping. Per Google, it carries functional data (timestamp, user agent on web, referrer) plus coarse information: an indication of whether the current page or a prior page in the visitor's navigation included ad-click information in the URL, a boolean consent state, a random number generated on each page load, and which consent platform you use. The ad-click identifier itself is a separate question. With `ad_storage` denied, full page URLs including ad-click parameters are still collected unless you also set `ads_data_redaction` to true, which redacts GCLID and DCLID from consent and conversion pings. IP addresses are used to derive country and, in Google's account, are never logged by the Google Ads and Floodlight systems.

Whether that counts as "not tracking" is a judgement for your DPO, not your ad agency. Either way, "consent denied" in advanced mode does not mean nothing happens. Less happens, and Google estimates the rest.

## The honest trade-off: modelled data against real data

Behavioural modelling is the reward for advanced mode. It is genuinely clever, and the gates are high. A GA4 property needs at least 1,000 events per day with `analytics_storage='denied'` for at least seven days, plus at least 1,000 daily users sending events with `analytics_storage='granted'` on seven of the previous 28 days. Even then eligibility is not guaranteed, because the model applies further criteria such as new-to-returning user ratios. A site doing a few thousand sessions a month can implement all of consent mode v2 and get no modelling at all.

When it does work, modelled data is not available everywhere. Google states it is unsupported in audiences, the user explorer, cohort and user lifetime explorations, segments containing sequences, retention reports, predictive metrics and BigQuery export. Retention and cohorts, the questions a product team cares most about, are exactly what modelling cannot fill.

## When you genuinely need it

The answer here is not "never".

- **You run personalised advertising or remarketing for EEA, UK or Swiss traffic.** Google's guidance is that without consent mode you lose personalised advertising and remarketing features, plus measurement for them. Both `ad_user_data` and `ad_personalization` must be granted for personalised ads.
- **You upload Customer Match lists for EEA users.** From March 2024, both consent fields must be granted for those lists to be usable in the EEA, the same month Digital Markets Act obligations began applying to designated gatekeepers.
- **You rely on enhanced conversions or conversion-driven bidding.** These lean on `ad_user_data`.
- **You are a publisher on AdSense, Ad Manager or AdMob.** Related but separate: Google requires a certified CMP integrated with the TCF for personalised ads in the EEA and UK as of 16 January 2024, and Switzerland as of 31 July 2024.

Google is equally direct about the inverse: if you already use consent mode and do not engage in personalised advertising such as remarketing, you need take no action. Plenty of sites implementing consent mode v2 in 2026 do not buy Google Ads at all.

If you do stay, one date matters. From 15 June 2026, Google Analytics moves to consent mode as the single control for collecting Google Ads cookies and IDs, with Google Signals reduced to controlling the association of Analytics data with signed-in user information for behavioural reporting. Your consent configuration becomes the only gate.

## The alternative path: no consent signal at all

If your goal is knowing which pages work, where users drop out of onboarding and which channel converts, none of the above is necessary. That is a measurement problem, not an advertising one.

Under ePrivacy, the consent requirement is triggered by storing or reading information on the user's device. A tool that writes nothing to the device does not fire that trigger for anonymous measurement, so there is no consent signal to send and no gap to model. Full reasoning in [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

Privytics works this way. The anonymous visitor id is a daily rotating salted hash of IP address, user agent and project id, salt rotating at midnight UTC, with nothing written to the browser. Event data is stored in EU data centres in Germany. If you want consent gating anyway, initialise with `disabled: true` and call `ready()` after consent.

| Question | GA4 with Consent Mode v2 | Cookieless analytics (Privytics) |
| --- | --- | --- |
| Banner needed for analytics | Yes, GA4 uses cookies by default | Generally not for anonymous stats |
| Data from visitors who decline | Modelled estimate, if you qualify | Measured, everyone counted |
| Minimum size to benefit | 1,000 denied events/day plus 1,000 granted daily users | None |
| Modelled data in retention and cohorts | Not supported | Not applicable, figures are measured |
| Google Ads remarketing | Yes, this is the point of it | No |
| Data location | Google infrastructure, US company under the Data Privacy Framework | EU data centres in Germany |
| Implementation surface | Banner, CMP, four signals, default and update calls | One script tag |

Being straight about the limit: cookieless analytics does not replace Google Ads conversion measurement. If ad spend is how you grow, keep Google for the ads and use a cookieless tool for the truth about your site. On the wider legal question, see [is Google Analytics legal in the EU in 2026](/blog/is-google-analytics-legal-eu-2026).

## Migration sketch

1. **Decide which job you need Google for.** If you do not buy Google Ads, the answer is often "none" and the consent mode project can be cancelled outright.
2. **Add the cookieless tool alongside GA4.** Run both for a few weeks. Expect higher counts on the cookieless side, because no visitor is excluded by declining consent. Ad blockers still apply to both, which is a separate problem covered in [serving analytics from your own domain](/blog/ad-blockers-analytics-first-party-proxy).
3. **Rebuild your four real reports, not all of them.** Traffic sources, top pages, the signup funnel, retention.
4. **Trim the banner.** Check what else sets non-essential cookies. Analytics is usually only one reason a banner exists.
5. **Keep GA4 narrowly, if you must.** If ads depend on it, configure consent mode v2 for the advertising signals only and stop treating GA4 as your source of product truth.

Step by step, with event mapping, in [migrating from GA4 to cookieless analytics](/blog/migrate-from-google-analytics-ga4-cookieless).

## FAQ

### Is Google Consent Mode v2 mandatory?

Not universally. It is required in practice for personalised advertising, remarketing or their measurement for users in the EEA, the UK or Switzerland. Google's own position is that existing consent mode users who do no personalised advertising need change nothing. It is a Google product requirement layered on the EU user consent policy, not a law in itself.

### What is the difference between basic and advanced consent mode?

The difference is what happens to a visitor who declines. Under basic, that visitor is simply absent from your data. Under advanced, a cookieless ping is still sent, and that ping is the raw material for GA4's behavioural modelling, which is why only advanced can offer it. Basic is the more conservative choice, advanced is the one Google pushes.

### Does Consent Mode v2 make Google Analytics cookieless?

No. GA4 uses first-party cookies by default. Consent mode changes what the tag does when consent is withheld and lets Google model the missing data: estimation filling a gap, not measurement without cookies. A cookieless tool writes nothing to the device in the first place. See [what is cookieless analytics](/blog/what-is-cookieless-analytics).

### Will behavioural modelling fix my missing data?

Only if you are large enough, and only for some reports. The eligibility thresholds are in the section above, and meeting them still does not guarantee the model trains. Even when it does, the reports a product team leans on hardest, retention and cohorts among them, do not use modelled data at all, so the gap stays a gap there.

### Can I drop the cookie banner if I switch to cookieless analytics?

For anonymous analytics, usually yes, because nothing is stored on or read from the device and the ePrivacy trigger does not fire. You may still need a banner for marketing pixels, embedded video or live chat. Cookieless analytics removes one common cause of banners, not automatically all of them, and you remain the data controller.

## Trying Privytics

If consent mode has become a standing engineering cost to recover a partial estimate of your own traffic, price the other path. Privytics is managed cookieless product analytics: events, funnels, retention, cohorts and dashboards, with data in EU data centres in Germany and nothing written to the visitor's device. It is built on the open-source OpenPanel engine (AGPL-3.0), and is independent, not affiliated with or endorsed by OpenPanel.

The free tier is 10,000 events a month on one project, 12 months of retention, no credit card. Paid plans are stepped by event volume from EUR 10 per month for 100k events excluding VAT, adding session replay and five-year event history. Privytics is a newer service than Google Analytics, and if Google Ads is central to how you grow, keep GA4 with consent mode v2 for the advertising signals. For everything else, you probably need no consent signal at all.
