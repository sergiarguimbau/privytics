---
slug: privytics-vs-amplitude
title: "Privytics vs Amplitude: Cookieless EU Analytics Compared"
description: An honest comparison of Privytics and Amplitude on price, EU data residency, cookies, retention and analysis depth, with the cases where Amplitude wins.
date: 2026-07-19
updated: 2026-07-29
tag: Comparison
---

Amplitude is the deeper product analytics platform. If you need behavioural cohorts, causal inference, experimentation and feature flags in one suite, it does things Privytics does not attempt. Privytics is a smaller, EU-hosted alternative that is cookieless by default, built on the open-source OpenPanel engine, and publishes every price up to 10 million events a month. Pick Amplitude for depth at scale. Pick Privytics if you want simple, EU-resident analytics with pricing you can read off a page.

Before anything else: Privytics is a newer service than Amplitude, which has been operating for years. Nothing below claims we are faster, more accurate or more reliable. The comparison sticks to facts either side publishes: price, hosting location, storage behaviour, retention and features.

One more thing to get out of the way early, because it matters more than any feature table: Amplitude's free tier is far more generous than ours. Amplitude includes 2 million events per month, forever, with unlimited seats and no credit card (checked 2026-07-29). Privytics includes 10,000 events per month. If your only criterion is how much you can track for nothing, Amplitude wins that comparison outright and we are not going to pretend otherwise.

## Comparison at a glance

| Attribute | Privytics | Amplitude |
|---|---|---|
| Category | Product and web analytics | Product analytics platform, web analytics layered on top |
| Free tier | 10,000 events/month, no card, 1 project | 2M events/month, forever, no card, no time limit, unlimited seats |
| Paid entry price | EUR 10/month for 100k events (excl. VAT), as of July 2026 | Plus is published as "Starts at $0", with the first 2M events/month free and pricing growing with volume after that. The rate above the free allowance is not published (checked 2026-07-29) |
| Published price ladder | Yes, to 10M events/month, as of July 2026: EUR 10 / 100k, 20 / 500k, 40 / 1M, 100 / 5M, 200 / 10M | Partial. Plus scales with volume up to 70M events but intermediate figures are not published; Growth and Enterprise are Custom |
| Data location | Germany, EU only | AWS, US or EU region. EU region is Frankfurt, Germany, chosen at signup |
| Cookies by default | None. No cookies, no device storage for anonymous analytics | Yes. Browser SDK 2 writes AMP_ and AMP_MKTG_ first-party cookies on init |
| Cookieless option | Default behaviour | Opt-in config. `identityStorage: 'localStorage'` or `'none'`; `'none'` means a new device_id per visit |
| Visitor identity | Daily-rotating salted hash of IP, user agent and project id | deviceId persisted in cookie or local storage |
| Session replay | Paid plans only, opt-in per project, all text and inputs masked by default | Included from the free plan. The pricing page lists 10K replays/month on Free, 20K on Growth and 50K on Enterprise; the Plus figure is not broken out separately |
| Data retention | 12 months free, 5 years on paid | 2 years listed for Plus. Other tiers not published |
| Source code | Engine is AGPL-3.0 (OpenPanel), our source is public | Backend closed. Client SDKs are published on GitHub; the TypeScript/browser SDK is MIT licensed |
| Self-hosting | Yes, the same engine can be self-hosted | Not offered as a published option. Amplitude is delivered as a hosted cloud service |
| Billing | Polar as Merchant of Record, collects and remits EU VAT | Direct, USD, sales-led above the published tiers |

Prices, plan limits, retention and residency details for Amplitude were checked on 2026-07-29 against [amplitude.com/pricing](https://amplitude.com/pricing), [amplitude.com/plus](https://amplitude.com/plus), [amplitude.com/security-and-privacy](https://amplitude.com/security-and-privacy) and Amplitude's Browser SDK 2 cookie and consent documentation. Where Amplitude does not publish a figure, this page says so rather than estimating one.

## Where the two products actually differ

### Analysis depth

Amplitude's chart library is far deeper than ours. Alongside the usual event segmentation, funnels, retention and stickiness, it ships Journeys, Lifecycle, Engagement Matrix, Revenue LTV, Compass for finding behaviours that predict retention, Personas for cluster analysis, Impact Analysis for causal inference, and raw SQL. Behavioural cohorts are a first-class object that can be synced to downstream tools. On top of the analytics sit experimentation, feature flags, guides, surveys and a CDP.

Privytics gives you funnels, retention and cohorts without cookies, plus dashboards, profiles, custom events and a REST API. It covers both sides of the [product analytics and web analytics](/blog/product-analytics-vs-web-analytics) split rather than specialising in one, which is enough for the questions most small teams actually ask. It does not give you causal inference, clustering or an experimentation platform, and we are not going to claim it does. Amplitude's closest rival for that kind of depth is Mixpanel, and the same trade-off runs through our [Privytics vs Mixpanel](/blog/privytics-vs-mixpanel) comparison.

### Cookies and consent

This is the clearest technical difference. Amplitude's Browser SDK 2 creates first-party cookies as soon as it initialises: an `AMP_` cookie holding deviceId, userId and sessionId, and an `AMP_MKTG_` cookie holding UTM parameters. You can turn that off, but it is opt-in configuration, and the fully storage-free mode has a documented cost: with no persistent storage the SDK cannot recognise a returning visitor, so it mints a new device_id on every visit. Moving identity to local storage avoids the cookie but not the consent question, since local storage is still terminal storage under the ePrivacy Directive.

Amplitude is straightforward about where the burden sits. Its own guidance is that you are responsible for obtaining consent, making disclosures and classifying its cookies in your policy, and that if you need to avoid cookies before consent you should not initialise the SDK until the user has consented.

Privytics sets no cookies and uses no device storage for anonymous analytics at all. The anonymous visitor id is a salted hash of IP address, user agent and project id, and the salt rotates at midnight UTC, so ids reset daily and cannot follow a person across days. If that mechanism is new to you, our explainer on [what cookieless analytics is](/blog/what-is-cookieless-analytics) walks through it in more detail. That is a real tradeoff in the other direction: we genuinely cannot tell you that a visitor came back last week. Privytics also ships consent gating for teams that want it, by initialising with `disabled: true` and calling `ready()` after consent.

Neither product makes you compliant on its own, and none of this is legal advice. You remain the data controller for your own site, and your compliance obligations are yours. What differs is the default storage behaviour of each SDK.

### Data residency

Both offer EU hosting, so this is not a binary win. Amplitude runs AWS data centres in the US and the EU, with the EU region in Frankfurt. It self-certifies under the EU-US Data Privacy Framework and the UK Extension, with HIPAA available via BAA and AWS infrastructure certified to ISO 27001 and SOC 2 Type II. That is a stronger formal compliance posture than Privytics offers.

The practical differences: Amplitude's region is chosen when the organisation is provisioned rather than toggled later in settings, and EU projects send data to the EU endpoints such as `api.eu.amplitude.com` instead of the default US ones. Changing region after the fact is not a self-service switch. Privytics has no US region to pick, because analytics event data is stored in Germany. Privytics is an independent European service, operated from Spain rather than by a US company, which some buyers care about and others do not. Our sub-processors, including US-based ones for billing, email, monitoring and AI features, are listed in Section 7 of our [privacy policy](/privacy).

### Pricing transparency

Amplitude's free plan is excellent. Above the free allowance, visibility drops. Both the pricing page and the Plus page describe Plus the same way: starts at $0, includes 2 million events a month, then grows with your event volume up to 70 million events (both checked 2026-07-29). Neither page publishes the rate you pay once you pass the free allowance, so the ladder is not readable without running the estimator. Growth and Enterprise are quoted as Custom, which means a sales conversation. The pricing page does state two Plus limits: 20 behavioural cohorts and two years of data retention.

Privytics publishes every price up to 10 million events per month, in euros, excluding VAT, with no sales call, and as of July 2026 they are: EUR 10 for 100k, 20 for 500k, 40 for 1M, 100 for 5M, 200 for 10M. Above 10M is custom. These are stepped tiers rather than metered usage, so the bill is the flat price of whichever tier your volume falls into. Both products get more expensive with chatty instrumentation, but only one of them lets you model the bill yourself before signing up.

The arithmetic still favours Amplitude at low volume. At 1 million events a month, Amplitude's free tier costs nothing and Privytics costs EUR 40. Privytics only becomes the cheaper option once you pass Amplitude's 2M free allowance, and even then the comparison depends on prices Amplitude does not publish.

## When Amplitude is the better choice

- **You have a real product team doing behavioural analysis.** Compass, Personas, Impact Analysis and Journeys have no equivalent in Privytics. If those charts are how you make decisions, nothing else here matters.
- **You are under 2 million events a month and want to spend nothing.** Amplitude's free allowance is 200 times ours, includes unlimited seats and includes 10,000 session replays per month (checked 2026-07-29). Privytics keeps session replay on paid plans only.
- **You need experimentation, feature flags, guides or a CDP from one vendor.** Consolidating those into a single SDK and contract is a legitimate reason to choose Amplitude.
- **You need enterprise governance.** SSO and project permissions from Growth, RBAC and data access controls at Enterprise, HIPAA via BAA, and SOC 2 Type II certified AWS infrastructure (checked 2026-07-29). Privytics has none of that.
- **You already run a consent management platform.** If a banner is a settled part of your stack, the cookieless argument for Privytics loses most of its force.
- **Session replay is central to your workflow.** Amplitude links replays directly from quantitative charts, with rage-click and dead-click signals and heatmaps. Privytics keeps replay on paid plans, opt-in per project and masked by default, and the [consent questions around session replay](/blog/gdpr-session-replay-consent) apply whichever tool is doing the recording.

## When Privytics fits better

You want analytics that sets no cookies by default, stores event data in Germany, publishes its prices, and runs on an engine you could self-host if you ever wanted to leave. Funnels, retention, cohorts, dashboards, profiles, custom events and a REST API cover the questions you actually ask, and you would rather read a pricing page than book a call. Data export is available at any time.

## FAQ: Privytics vs Amplitude

### Is Amplitude GDPR compliant?

Amplitude offers an EU region in Frankfurt, self-certifies under the EU-US Data Privacy Framework, and can sign a BAA for HIPAA. No analytics tool makes you compliant by itself. You remain the data controller and are responsible for lawful basis, disclosures and consent, whichever product you use.

### Does Amplitude use cookies?

Yes, by default. Its Browser SDK 2 writes two first-party cookies on initialisation, `AMP_` and `AMP_MKTG_`. You can switch identity storage to local storage or disable storage entirely, but that is opt-in, and disabling storage means losing returning-visitor identity.

### Is Privytics cheaper than Amplitude?

Not below 2 million events a month, where Amplitude's free plan costs nothing and Privytics costs up to EUR 40 for 1M events (prices as of July 2026). Above Amplitude's free allowance the comparison is hard to make, because Amplitude does not publish the rate that applies past the free events and Growth and Enterprise are quoted by sales.

### Can I self-host either one?

Privytics runs on the open-source OpenPanel engine under AGPL-3.0, so the same engine can be self-hosted. Amplitude is a hosted cloud service and does not publish a self-hosting option, although its client SDKs are on GitHub and the TypeScript/browser SDK is MIT licensed.

### Do I still need a cookie banner with Privytics?

Privytics sets no cookies and uses no device storage for anonymous analytics, which removes the technical trigger that most banners exist for. Your legal obligations still depend on what else you run and on your own assessment, so check with your advisers. There is more detail in our guide to [cookieless analytics and the cookie banner question](/blog/cookieless-analytics-gdpr-cookie-banner).

---

Privytics is built on the open-source OpenPanel engine. It is an independent service and is not affiliated with, endorsed by or sponsored by OpenPanel. If the EU hosting and cookieless defaults are what you are after, the free tier gives you 10,000 events a month with no credit card. If you need Amplitude's depth, use Amplitude.
