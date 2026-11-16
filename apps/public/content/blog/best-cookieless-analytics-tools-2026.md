---
slug: best-cookieless-analytics-tools-2026
title: "Best cookieless analytics tools 2026: which are truly cookieless"
description: Which cookieless analytics tools are truly cookieless by default in 2026, compared: Plausible, Fathom, Simple Analytics, Umami, Privytics, Matomo and GA4.
date: 2026-07-22
updated: 2026-07-29
tag: Comparison
---

"Cookieless" is one of the most abused words in analytics marketing. Plenty of tools that call themselves privacy-friendly still set a cookie the moment the page loads, which means you are back to a consent banner whether you like it or not. The question that actually matters is narrower: is the tool cookieless **by default**, out of the box, with no configuration? That is the line that decides whether the anonymous case needs a banner at all.

This roundup sorts the popular tools by that single test. Some are cookieless the instant you install them. Some can be made cookieless if you dig into the settings. And a couple are not cookieless in their default setup, no matter how they are marketed. We run Privytics, so treat us as an interested party, but the goal here is an honest map, including the places where another tool is the better pick.

*Prices, features, and compliance notes last reviewed 2026-07-29; verify current figures on each vendor's own page before acting. Nothing here is legal advice.*

## Comparison table

| Tool | Cookieless by default | Free tier | EU hosting | Focus |
|------|----------------------|-----------|-----------|-------|
| Plausible | Yes | No (30-day trial) | Yes | Web |
| Fathom | Yes | No (7-day trial) | Partial (EU processing, US storage) | Web |
| Simple Analytics | Yes | Yes (free-forever, badge required) | Yes (Netherlands) | Web |
| Umami | Yes | Yes (Hobby) | Not documented per region | Web plus basic funnels/retention |
| Privytics | Yes | Yes (10k events/mo) | Yes (Germany) | Product |
| Matomo | Configurable | Self-host free; Cloud paid | Yes (Cloud, Frankfurt) | Web plus product |
| PostHog | No (opt-in) | Yes (1M events/mo) | Yes (EU Cloud) | Product |
| Google Analytics 4 | No | Yes | No (US) | Hybrid web/marketing |

## What "cookieless by default" actually buys you

The main trigger for a cookie/consent banner under the EU ePrivacy rules is storing or reading information on the visitor's device. A tool that never writes a cookie or a persistent identifier to the browser sidesteps that specific trigger. That is why the cookieless-by-default tools below can, in the common anonymous case, run without a banner. If you want the mechanics rather than the shortlist, [what cookieless analytics is](/blog/what-is-cookieless-analytics) covers how these tools count people without keeping anything on the device.

Two honest caveats. First, GDPR still governs any personal data you process, so if you identify users or handle IP addresses in certain ways, obligations remain, and interpretations vary by country and by data protection authority. Second, "cookieless" and "no banner" are not automatically the same thing everywhere, so check your own jurisdiction. What cookieless does reliably remove is the biggest and most annoying trigger. We walk through the banner question in more detail in [cookieless analytics and the GDPR cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

## Plausible

Cookieless by default, no persistent identifiers, no banner. Plausible is one of the cleanest examples of the category and is AGPL open source, so you can self-host it for free.

It is paid-only on the cloud (30-day trial, no credit card required, no free tier). As of July 2026 the pricing page lists USD 9/mo on Starter at 10k pageviews, USD 14 on Growth and USD 19 on Business, all scaling up with pageviews. Funnels and user journeys are listed on the Business plan only, and there is no retention or cohort analysis. Plausible is deliberately a lightweight web analytics tool: pageviews, sources, top pages, done well. If that is all you want, it is excellent.

## Fathom

Cookieless by default, no consent banner, and a Canadian corporation. Its EU Isolation is not an optional extra: Fathom states it is enabled by default for everyone on every plan, that EU traffic is processed on its own servers located inside EU borders, and that EU visitor IP addresses are stripped inside the EU and never reach US infrastructure. The anonymised result is then stored on its main US servers, so this is EU processing rather than end-to-end EU residency.

Paid-only with a 7-day trial and no free plan. The pricing page answers the free-tier question directly and says no. Pricing is a single feature tier billed by volume, so every plan gets every feature. As of July 2026 the pageview selector runs from 100k upward but opens on the 500k step at USD 45/mo, which makes Fathom look pricier at a glance than its actual entry rung. The 100k step is cheaper, though Fathom renders that figure client side, so check it on the pricing page before you budget. Every plan includes at least 50 sites, which is generous. Like Plausible, it is web analytics (pageviews, sources, goals) with no funnels, retention, or cohorts, and it is closed-source and cloud-only.

## Simple Analytics

Cookieless by default, no banner, company and servers in the Netherlands, data never leaves the EU. On the privacy and residency axis it is one of the strongest here.

As of July 2026 it advertises a free-forever plan (1 user, up to 5 sites, one month of history, unlimited pageviews under a fair-use policy, and a required badge on your site), alongside a 14-day full-feature trial with no credit card. Paid self-serve starts at EUR 20/mo and scales with volume. It is web analytics: pageviews, sources, events and goals on paid, with no funnels, retention, or cohorts. Closed-source and cloud-only.

## Umami

Cookieless by default, no banner required, MIT-licensed and free to self-host. Umami is the counterexample to the idea that web tools only ever count pageviews.

The cloud Hobby plan is genuinely free at 100k events a month, with paid tiers scaling above it (position as of July 2026). Umami renders its plan prices and limits client side, so read the current prices, site counts, and retention windows off its own pricing page rather than trusting any comparison post, this one included. Session replay and heatmaps both appear in Umami's documentation. Its public docs do not describe a customer-selectable EU-only region, so if EU-only residency is a hard requirement, ask Umami directly before committing. Historically Umami was pure web analytics, but its docs now cover Funnel, Retention, and Journey reports, so it has drifted into light product analytics. It is a strong free option, especially self-hosted.

## Privytics

This is us, so here is the plain version. Privytics is cookieless by default. Instead of a device identifier, it derives a salted hash from IP, user agent, and project id, with the salt rotating at midnight UTC. Nothing is written to or read from the visitor's device, so the anonymous case needs no consent banner. If you want cross-session, cross-device identified analytics, that is opt-in through `identify()` using your own user id, and it is off until you turn it on.

Where Privytics differs from the web tools above is scope: it is **product analytics** built on the open-source OpenPanel engine (AGPL-3.0). Privytics is an independent service and is not affiliated with or endorsed by OpenPanel. You get custom events, funnels, retention, cohorts, dashboards, per-user Profiles, and a REST API, not just pageview counts, which is the [product analytics versus web analytics](/blog/product-analytics-vs-web-analytics) split in practice. Analytics data is stored in Germany, and the service is operated from Spain. The free tier is 10,000 events/month for one project, with no credit card and 12-month retention. Paid runs on stepped tiers rather than usage metering: EUR 10 per 100k events, EUR 20 per 500k, EUR 40 per 1M, EUR 100 per 5M, EUR 200 per 10M (per month, ex VAT), custom above that. Paid adds session replay, which is opt-in per project and masks all text and inputs by default, plus 5-year event history.

The honest caveats: Privytics is a newer service than Plausible, Fathom, or Matomo, which have been operating for years. Events are counted, not pageviews, so a busy product can move through the free tier faster than a content site would, and if you only need a pageview counter you are paying for capability you will not use. Above 10k events you are on a paid plan, whereas Umami and PostHog have much larger free allowances.

## Matomo

Matomo is cookieless when configured that way. It ships with a compliance screen under Administration, Privacy, Compliance, where enabling "Enforce compliance where possible" applies most of the CNIL exemption restrictions at once, though Matomo's own FAQ is clear that some steps, such as publishing an opt-out, stay manual. Either way this is something you switch on rather than the default, so we mark it "configurable" rather than "cookieless by default."

Two paths exist. Self-hosted Community edition is free and unlimited (you carry the real ops cost of running it). Cloud is paid-only with a no-credit-card trial, starting at USD 29/mo for 50k hits as of July 2026, with data stored in Frankfurt. Matomo's own FAQ states that 100% of customer data and backups are stored in Europe. The operator, InnoCraft, is a New Zealand registered company. Matomo is the closest thing here to a full GA replacement: pageviews plus funnels, cohorts, heatmaps, session recordings, and goals. It is feature-rich and heavier, and some advanced features are paid add-ons on self-hosted.

## PostHog

Here is where the "cookieless" label breaks. PostHog uses cookies **by default**: its posthog-js docs give the default persistence mode as `localStorage+cookie`, with the distinct id and session id kept in a cookie whose default expiry is 365 days. A cookieless mode exists (`memory` persistence), but it is opt-in, and the default setup generally needs a consent banner. So despite being a great product analytics tool, PostHog does not belong in the cookieless-by-default column without you changing the config.

What it does offer is a very generous free tier (1M product analytics events/month as of July 2026, then usage-based) and a deep all-in-one feature set: funnels, retention, cohorts, session replay, feature flags, and experiments, with EU Cloud in Frankfurt or US Cloud in Virginia chosen at signup. It is open source but increasingly Cloud-steered for non-hobby use. If cookieless-by-default is your hard requirement, either flip PostHog into cookieless mode deliberately or pick a tool that is cookieless out of the box.

## Google Analytics 4

Not cookieless. GA4 uses cookies and expects consent, leaning on Consent Mode and behavioral modeling for unconsented traffic. It is free (GA360 is the custom-priced enterprise tier) and offers funnel and cohort exploration plus tight Google Ads and BigQuery integration.

On the two axes this article cares about, cookieless and EU data residency, GA4 is the weakest option. Google does publish EU-focused data controls, including handling EU traffic on EU-based servers before it reaches Analytics processing, but that is not EU-only, EU-owned residency, and transfers run under the EU-US Data Privacy Framework, whose status is still contested. GA4 is also proprietary and not self-hostable. If you are reading a cookieless roundup, GA4 is most likely the thing you are trying to move away from.

## When another tool is the better choice

Pick **Plausible or Fathom** if you want a mature, dead-simple pageview dashboard and you do not need funnels, retention, or product-level events. They are lighter than Privytics and have a multi-year track record. If you have already narrowed it to those two, [Plausible versus Fathom](/blog/plausible-vs-fathom) works through where they actually differ.

Pick **Simple Analytics** if EU data residency is your single most important factor and a content-site free plan with a badge is acceptable.

Pick **Umami** if you want the largest genuinely free allowance while staying cookieless, or you are happy self-hosting. Its cloud has enough funnels and retention for many teams.

Pick **PostHog** if you need the full product-analytics-plus-feature-flags-plus-replay suite and you are willing to configure cookieless mode (or run a banner). Its free tier is far larger than ours.

Pick **Matomo** if you want a full GA replacement with heatmaps and session recordings and you can either pay for Cloud or run the self-hosted edition yourself.

Pick **Privytics** if you specifically want cookieless-by-default **product** analytics (funnels, retention, cohorts, Profiles) that is EU-hosted, with a real free tier and no banner for anonymous traffic. That combination is the narrow gap we fit into. If you fall outside it, one of the tools above is the better call, and we would rather tell you that than lose your trust.

## FAQ

### Does cookieless analytics still need a consent banner?

Often no, for the anonymous case. The main banner trigger under ePrivacy is storing or reading information on the device, and a truly cookieless tool never does that. GDPR still applies to any personal data you process, and interpretations vary by country and authority, so this is not legal advice. Privytics stores nothing on the device for anonymous visitors, and identified tracking is opt-in.

### How do cookieless tools count unique visitors without a cookie?

Most derive a temporary identifier from signals like IP, user agent, and a site key, hashed with a salt that rotates (Privytics rotates the salt daily). That lets them count a visitor within a day without persisting anything to the browser. The trade-off is that unique-visitor counts across longer windows are estimates rather than exact device-level tracking, which is the intended privacy behavior.

### Is Google Analytics cookieless?

No. GA4 sets cookies by default and expects consent, using Consent Mode to model unconsented traffic. You can reduce its cookie footprint, but it is not cookieless out of the box, and it is US-hosted. If cookieless-by-default matters, GA4 is not the tool.

### Can I get product analytics like funnels and retention without cookies?

Yes. This is exactly the gap Privytics targets: cookieless-by-default funnels, retention, cohorts, and per-user Profiles, which we explain in [how funnels, retention and cohorts work without cookies](/blog/funnels-retention-cohorts-without-cookies). Umami Cloud now offers lighter funnels and retention while staying cookieless, and PostHog offers deep product analytics but uses cookies by default unless you enable cookieless mode.

### Which cookieless tool has a real free tier?

Umami (Hobby, 100k events), Privytics (10,000 events/month), and Simple Analytics (free-forever with a required badge and one month of history) all have genuine free plans. Plausible and Fathom are trial-only. PostHog has a large free allowance but is cookie-based by default.

### Is cookieless less accurate than cookie-based tracking?

For most reporting, no meaningful difference. You still get accurate pageviews, sources, and event counts. Where cookieless is deliberately fuzzier is long-window unique-visitor and cross-device identity, because it avoids persisting identifiers. For teams that want candid, privacy-first numbers rather than inflated cross-device counts, that trade is usually the point.

## Trying Privytics

If you want product analytics that is cookieless by default, EU-hosted in Germany, and free up to 10,000 events a month with no credit card, Privytics is built for exactly that. You get funnels, retention, cohorts, dashboards, and per-user Profiles without dropping a cookie or showing a banner to anonymous visitors, and identified tracking stays opt-in through your own user id.

If your needs point clearly at Plausible, Umami, PostHog, or Matomo, take them. But if the specific combination of cookieless, product-grade, EU-hosted, and a real free tier is what you have been hunting for, that is the corner we were built to fill.
