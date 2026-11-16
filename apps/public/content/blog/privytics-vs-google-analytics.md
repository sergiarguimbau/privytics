---
slug: privytics-vs-google-analytics
title: "Privytics vs Google Analytics 4: EU-Hosted, Cookieless Analytics"
description: "A fair, technical comparison of Privytics and Google Analytics 4: data ownership, cookie banners, sampling, EU hosting, complexity and when GA4 still wins."
date: 2026-07-19
updated: 2026-07-29
tag: Comparison
---

Google Analytics 4 is free, enormously capable, and tightly wired into Google Ads. Privytics is an EU-hosted product analytics service with a free tier and paid plans priced by event volume. It sets no cookies by default and stores analytics event data in Germany. The honest summary: if your business runs on Google Ads, or you need free analytics at very large scale, GA4 is hard to beat. If you want a smaller product analytics tool, EU data residency, and a setup that does not require a cookie banner for anonymous analytics, Privytics is built for that instead.

This post compares the two on concrete attributes rather than slogans. Privytics is a newer service than Google Analytics, which has been operating for years. Everything below is a design fact, not a performance claim.

Google Analytics 4 details in this post were re-checked on 2026-07-29 against Google's own documentation, chiefly the Analytics Help articles on data retention, data sampling and BigQuery Export, plus Google's own Analytics 360 pages. Where Google does not publish a number, notably the price of Analytics 360, this post does not invent one. Google changes its tiers, limits and reporting behaviour regularly, so verify anything that matters to your decision against Google's own documentation before you act on it. Nothing here is legal advice.

## The short answer

GA4 is free in cash terms on the standard tier. The trade-offs show up elsewhere: consent infrastructure, a data model that takes real time to learn, thresholding and sampling in some reports, retention limits on the standard tier, and the fact that your visitor data is processed inside Google's platform, which is also an advertising business. Whether that last point matters is a judgement call for your organisation, not a defect.

Privytics is free up to 10,000 events a month and charges above that, and it gives you a narrower product in return: custom events, funnels, retention, cohorts, dashboards, profiles and a REST API, with analytics event data stored in Germany and [no cookies used for anonymous measurement](/blog/what-is-cookieless-analytics).

## Comparison table

| Attribute | Privytics | Google Analytics 4 |
|---|---|---|
| Analytics data storage location | Germany | Google's global infrastructure, region depends on Google's own configuration |
| Cookies for anonymous analytics | None. No device storage at all | Uses cookies by default for client identification |
| Anonymous visitor identity | Daily-rotating salted hash of IP, user agent and project id. Salt rotates at midnight UTC | Persistent client identifier, subject to Google's own controls |
| Cross-day visitor tracking | Not possible for anonymous visitors by design | Supported |
| Cookie banner needed for basic analytics | Not required for the cookieless anonymous mode | Commonly required, depends on your jurisdiction and configuration |
| Consent gating in the SDK | Built in. Initialise with `disabled: true`, call `ready()` after consent | Available via Google's consent mode |
| Sampling and thresholding | Reports are computed from the events stored for your project | Sampling and data thresholding can apply to reports and explorations. As of July 2026 Google documents an event-level query quota of 10 million events on standard properties, against up to 1 billion on Analytics 360, which starts from a default of 100 million events per query |
| Data retention | 12 months on the free tier, 5 years on paid plans | Standard properties: 2 or 14 months for user and event data, set in admin. Analytics 360: the same 2 or 14 months for user data, plus 26, 38 or 50 months for event data. Google notes large and XL properties are limited to 2 months |
| Session replay | Opt-in per project, paid plans only, all text and inputs masked by default | Not part of the core product |
| Ad platform integration | None | Deep, native integration with Google Ads and the wider Google stack |
| Pricing model | Free tier at 10,000 events per month, then EUR 10 for 100k, EUR 20 for 500k, EUR 40 for 1M, EUR 100 for 5M, EUR 200 for 10M, per month excluding VAT, as of July 2026 | Free standard tier. Analytics 360 is the paid enterprise tier. As of July 2026 Google publishes no price for it and routes buyers to sales, so budget for a conversation rather than a number you can look up |
| Billing | Polar as Merchant of Record, collects and remits EU VAT | Google billing |
| Operating entity | Independent European service, operated from Spain | Google LLC, an Alphabet company |
| Source code | Built on the open-source OpenPanel engine (AGPL-3.0), our source is public | Proprietary |
| Data export | Full export any time | BigQuery export available on both tiers. Daily export is documented at 1M events for standard properties and up to 20B events for Analytics 360 |
| Self-hosting escape hatch | Yes, the underlying engine is AGPL | No |

## Where GA4 costs you something other than money

**Consent and cookie banners.** GA4 identifies clients with cookies by default. In most EU contexts that pushes you into consent banner territory, and every visitor who declines is a visitor you do not measure. Privytics avoids the cookie question for anonymous analytics entirely: the visitor id is a salted hash of IP address, user agent and project id, the salt rotates at midnight UTC, and nothing is written to the device. That design does not make you GDPR compliant on its own. You remain the data controller, and your own compliance assessment is yours to make, ideally with your own counsel. What the design does is remove one common reason for a banner, and we work through that reasoning in [cookieless analytics and the GDPR cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

**EU data transfer scrutiny.** Several European data protection authorities examined Google Analytics deployments in the years after the Schrems II ruling and raised concerns about transfers of personal data to the United States. The EU-US Data Privacy Framework changed the legal basis again, and the Framework is itself the subject of ongoing litigation, so the position today is neither what it was in 2022 nor settled for good. The practical point for a European business is simpler: with Privytics the analytics event data sits in Germany and there is a documented sub-processor list (Section 7 of our [privacy policy](/privacy)). That is a shorter list to work through in a vendor review, though it does not remove your own obligation to assess it. We go through the case law in more detail in [is Google Analytics legal in the EU in 2026](/blog/is-google-analytics-legal-eu-2026).

**Sampling and thresholding.** GA4 can apply sampling when a report, exploration or request goes over the event quota for your property, and it applies thresholding that hides rows when the underlying user counts are small. For a high-traffic marketing site that rarely matters. For a small SaaS trying to understand a funnel with a few hundred conversions, it matters more, because small segments are the ones most likely to be affected.

**The learning curve.** GA4's event and parameter model is powerful, and it takes time to learn. Custom dimensions, the difference between reports and explorations, and reconciling two views that disagree are all real work, and that work buys you capabilities Privytics does not have. Privytics is a smaller product with a smaller surface: you send events, you build funnels and retention charts, you query the REST API when you need something the UI does not do. Smaller is a trade, not automatically better.

**Retention.** GA4's standard tier caps how long user and event level data is kept, and the ceiling is set in the admin settings: 2 or 14 months for standard properties, with Analytics 360 going up to 50 months for event data. Google also documents that large and XL properties are capped at 2 months regardless of tier, which is worth knowing if you are the kind of high-volume site that would otherwise assume more headroom. Privytics keeps 12 months on the free tier and 5 years on paid plans. If you care about year over year cohort analysis, check the retention setting on whichever tool you choose before you need the data, not after.

## When Google Analytics 4 is the better choice

This section is not a formality. There are real situations where GA4 is the correct decision and Privytics is the wrong one.

**You run paid acquisition on Google Ads.** GA4 feeds conversions back into Google Ads natively, powers smart bidding, and shares audiences across the Google stack. Privytics has no ad platform integration and no plan to compete on this. If your growth depends on Google Ads optimisation, use GA4. You can always run Privytics alongside it for product analytics.

**You need free analytics at very large scale.** GA4's standard tier handles very high event volumes at no cash cost, and Google does not bill standard properties by event volume. Some limits do tighten as you grow rather than turning into a bill: daily BigQuery export on standard properties is documented at 1 million events, and properties Google classifies as large or XL drop to 2 months of retention. Privytics charges by event volume, so a large content site with tens of millions of monthly events will pay real money. If budget is the binding constraint and the data model is acceptable to you, GA4 wins on cost.

**You need the full marketing attribution stack.** Multi-channel attribution modelling, Search Console integration, YouTube data, BigQuery export into an existing Google data warehouse. Privytics does none of that. It is a [product analytics tool, not a marketing measurement suite](/blog/product-analytics-vs-web-analytics).

**Your team already knows GA4 and your reporting is built on it.** [Migrating off GA4](/blog/migrate-from-google-analytics-ga4-cookieless) has a cost. If your stakeholders read GA4 dashboards every Monday and nobody is complaining, the switch needs a stronger reason than philosophy.

**You need a vendor with a long operating history.** GA4 has been running at global scale for years, and Privytics is a newer service. If vendor maturity is a hard requirement in your procurement process, that is a legitimate reason to stay on GA4.

## Where Privytics fits

Privytics is a reasonable fit if you are a European SaaS or product company, you want product analytics rather than marketing attribution, you would prefer not to run a cookie banner for basic measurement, and you want the underlying data in the EU with an exit route. The AGPL escape hatch is part of that: the engine is open source, so self-hosting the same thing is always available if the managed service stops suiting you.

It is a bad fit if you need ad platform integration, free analytics at very large scale, or a vendor with a long operating history.

## FAQ

### Is Privytics a drop-in replacement for Google Analytics?

No. Privytics covers product analytics: events, funnels, retention, cohorts, dashboards and profiles. It does not replace GA4's marketing attribution, Google Ads integration or Search Console reporting. Many teams run both.

### Does Privytics need a cookie banner?

For anonymous analytics Privytics sets no cookies and uses no device storage, which removes one common reason for a banner. Whether you need consent still depends on your jurisdiction, what else your site loads and what data you collect. You remain the data controller, the decision is yours, and this is not legal advice.

### Where is my analytics data stored?

Analytics event data is stored in Germany. The full sub-processor list, including US-based providers for billing, email, monitoring and AI features, is in Section 7 of our [privacy policy](/privacy).

### Can I track logged-in users across days?

Yes, but only if you call `identify()` with your own user id and traits. Anonymous visitor ids are a daily-rotating salted hash and cannot follow a person from one day to the next by design.

### Can I get my data out?

Yes. Full export is available at any time, and there is a REST API. The underlying engine is AGPL-3.0 licensed, so self-hosting is always an option.

## Trying Privytics alongside GA4

The free tier is 10,000 events per month, one project, 12 months retention, community support and no SLA, with no credit card required. It is enough to instrument a side project, or to run Privytics next to GA4 for a month and compare what each one tells you. Session replay is a paid feature and is switched off on the free tier.

Privytics is built on the open-source OpenPanel analytics engine (AGPL-3.0) and is an independent service. It is not affiliated with, endorsed by or sponsored by OpenPanel or Google. Our source is public at https://github.com/sergiarguimbau/privytics, and if you would rather run the engine yourself than pay us, that is a supported outcome.
