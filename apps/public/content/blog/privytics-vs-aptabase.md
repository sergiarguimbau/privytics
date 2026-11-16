---
slug: privytics-vs-aptabase
title: "Privytics vs Aptabase: app-first vs product analytics"
description: "Privytics vs Aptabase compared: free tiers, pricing, cookieless tracking, funnels and retention, self-hosting and EU data residency, checked 2026-07-29."
date: 2026-07-22
updated: 2026-07-29
tag: Comparison
---

## The short version

Aptabase and Privytics start from the same instinct: analytics should be privacy-first, cookieless, and built on open source. They aim at different targets, though. Aptabase is a purpose-built, genuinely open-source event-analytics tool for mobile and desktop apps, with first-party SDKs for almost every app runtime, a free tier of 20,000 events a month as of July 2026, and official self-hosting. Privytics is a managed product analytics service with data stored in Germany, built on the open-source OpenPanel engine: web-first but with app SDKs, and it goes wider into funnels, retention, cohorts, per-user profiles, and session replay. If you are shipping a desktop or mobile app and want a simple, established tool you can also self-host, Aptabase is the more natural fit. If you want deeper product analytics across web and app in one managed EU service, Privytics covers more ground, with the honest caveat that Privytics is a newer service than Aptabase, which has been running since 2023.

Aptabase details were checked 2026-07-29 against its own site and its public repository; verify current figures before acting. Nothing here is legal advice.

## Feature and pricing comparison

| | Privytics | Aptabase |
|---|---|---|
| Primary focus | Web-first product and web analytics | App-first event analytics (mobile, desktop, web) |
| Free tier | 10,000 events/month, 1 project, no card, 12-month retention | 20,000 events/month as of July 2026, unlimited apps |
| Paid model | Stepped tiers as of July 2026: EUR 10 / 100k, EUR 20 / 500k, EUR 40 / 1M, EUR 100 / 5M, EUR 200 / 10M per month (ex VAT), custom above 10M | Event-based tiers as of July 2026: USD 10 / 200k, USD 20 / 1M, USD 40 / 2M, USD 75 / 5M, USD 140 / 10M, USD 240 / 20M, USD 450 / 50M, contact above 50M |
| Overages | Billed by the volume tier you land in | No overage billing; tracking pauses if you exceed the limit |
| Funnels, retention, cohorts | Yes | No, by design |
| Per-user profiles | Yes | No, fully anonymous |
| Session replay | Yes (on paid) | No |
| Cookieless / no consent banner | Yes (daily-rotating salted-hash visitor id) | Yes (no identifiers collected at all) |
| Open source | Runs on OpenPanel (AGPL); Privytics itself is a managed operator | Yes: AGPLv3 core, MIT-licensed SDKs |
| Self-hosting | You would self-host OpenPanel; Privytics as a service is managed only | Yes, official self-host path |
| Hosting region | EU only, stored in Germany | EU (Germany) or US (Virginia), your choice, or self-host anywhere |
| App SDKs | React Native, Swift (iOS), Kotlin (Android), plus web | Swift, Kotlin, Flutter, React Native, Electron, Tauri, .NET MAUI, NativeScript, Unity, Unreal, JS/web, Python |
| Operating entity | Independent European service, operated from Spain | Open-source project, public repository since March 2023 |

A note on the pricing rows: Aptabase sets its prices through an events-per-month slider in the pricing section of its homepage rather than as a static table, and unlimited apps, EU or US residency, the live dashboard, the session timeline and CSV export are listed as included at every rung. The figures above were read from that slider on 2026-07-29, so treat them as a snapshot and re-check before you commit. Two things follow from them, and both favour Aptabase on cost: its free plan carries twice our free allowance, and at the bottom of the paid ladder USD 10 buys 200,000 events where EUR 10 buys 100,000 on Privytics. Currencies, VAT treatment and what each tool counts as an event all differ, so read that as directional rather than exact.

## Web-first product analytics vs app-first event analytics

This is the real fork in the road, and it is worth being precise about it. It is the same split we set out in [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics), applied to apps rather than sites.

Aptabase is deliberately narrow. It measures anything you emit as an event: clicks, feature usage, screen views, custom actions. You get a real-time dashboard, a session timeline, and CSV export. That is the whole surface, and it is a good surface for the job it targets. What Aptabase does not do is user-level analysis. Its own documentation is upfront that metrics like monthly active users and retention are not possible in its model, and by extension neither are funnels or cohorts. That is not a gap they are hiding; it falls directly out of a design choice we cover below.

Privytics is broader. On top of custom events it gives you funnels, retention curves, cohorts, dashboards, per-user Profiles, and a REST API, and session replay lands on the paid plans. It is web-first in its heritage (the OpenPanel engine grew up around web and product analytics), but it ships [React Native](/for/react-native), Swift, and Kotlin SDKs, so app tracking is genuinely supported, not an afterthought.

The honest read: if your question is "how many people used this feature this week, and where did they drop off in my signup funnel," Privytics can answer it and Aptabase cannot. If your question is "how often is this button clicked across all my desktop builds," Aptabase answers it cleanly, and the extra machinery in a product-analytics tool is weight you do not need.

## Open source and self-hosting: both, but the deals differ

Both tools are open source at the engine level, and both deserve credit for it. The difference is in what "open source" gets you in practice.

Aptabase is open source end to end for the thing you actually run. Its core (backend plus dashboard) is AGPLv3, the SDKs are MIT-licensed, and there is an official, documented self-hosting path. You can take the whole platform, run it on your own infrastructure, and own the maintenance. That is a clean, complete open-source story for an app-analytics tool, and it is one of Aptabase's genuine strengths.

Privytics runs on OpenPanel, which is also AGPL, so the underlying engine is open in the same spirit. The distinction is that Privytics is a managed operator of that engine, not a self-host distribution, and it is an independent service, not affiliated with, endorsed by, or sponsored by OpenPanel. If you want to self-host, you would deploy OpenPanel yourself rather than run "Privytics" on your own servers, a trade-off we go through in [Privytics vs OpenPanel](/blog/privytics-vs-openpanel). Both are legitimate models, but if self-hosting the exact thing you evaluated is a hard requirement, Aptabase gives you that directly and Privytics points you to the upstream project instead.

## The identity question: why Aptabase cannot do funnels and Privytics can

The most interesting technical divergence is philosophical, and it explains the feature table above.

Aptabase collects no user identifiers at all. No cookies, no device IDs, no fingerprinting, no long-term identity. Data is described as completely anonymous and untraceable, and it positions itself as GDPR, CCPA, and PECR compliant on that basis. The upside is a very clean privacy posture with essentially nothing to reconstruct. The cost, which Aptabase accepts openly, is that without any notion of a persistent user you cannot compute retention, build cohorts, or trace an individual through a funnel.

Privytics is also cookieless in the [usual sense of the term](/blog/what-is-cookieless-analytics), but it draws the line in a different place. Its anonymous visitor id is a salted hash of IP, user agent and project id that rotates at midnight UTC, so nothing persists on the device and the anonymous case still needs no consent banner. On top of that, Privytics supports optional per-user Profiles when you call `identify()` in your own app. That optional identity is precisely what lets it compute retention, cohorts, and multi-step funnels, which we work through in [how funnels, retention and cohorts work without cookies](/blog/funnels-retention-cohorts-without-cookies). It is a different privacy-to-capability trade, not a claim that one is more private than the other in the anonymous case; both are cookieless and both avoid the consent-banner problem when no user is identified.

So the funnels-and-retention gap is not Aptabase being less capable by accident. It is the direct, honest consequence of choosing zero identity. If you value that zero-identity guarantee above product-analytics depth, Aptabase's stance is a feature, not a limitation.

## Data residency and regions

If you need to choose where data lives, the two differ. Aptabase Cloud lets you pick your region at signup, listing Germany for the EU option and Virginia for the US one, or you can self-host and put it wherever you like. Privytics is EU only, with analytics event data stored in Germany, which is a plus if strict EU residency is the goal and a constraint if you specifically need US-region hosting. Worth noting plainly: pick Aptabase's EU region and both tools store data in the same country, the difference being that with Aptabase it is a setting and with Privytics it is the only option. Neither approach is better in the abstract; it depends on where your users and your compliance obligations sit.

## When Aptabase is the better choice

Plenty of the time, honestly.

- **You are building a mobile or desktop app.** This is Aptabase's home turf. Its SDK coverage for app runtimes is broader than Privytics: Swift, Kotlin, Flutter, React Native, Electron, Tauri, .NET MAUI, NativeScript, Unity, and Unreal, among others. If you are on Tauri, Electron, Unity, Unreal, or .NET MAUI, Aptabase has a first-party SDK and Privytics does not.
- **You want an established, proven tool.** Aptabase's public repository dates to March 2023, it is still actively developed, and it carried just over 1,750 GitHub stars when we checked on 2026-07-29. Privytics is the newer service of the two, so for anything where a vendor's operating record matters, that gap is real and it favours Aptabase today.
- **You want to self-host the exact product you evaluated.** Aptabase gives you an official, documented self-hosting path for the whole platform under AGPLv3, with MIT SDKs. That is a cleaner self-host story than pointing you upstream.
- **You want deliberate simplicity and a strong anonymity guarantee.** If you do not need funnels, retention, or per-user analysis, and you value collecting no user identifiers whatsoever, Aptabase's narrow, fully anonymous design is a good match and less to reason about.

Do not let anyone tell you Privytics is a drop-in upgrade for app analytics. For a focused app-analytics use case, Aptabase is purpose-built and more mature, and that counts.

## FAQ

### Does Aptabase have a free plan?

Yes, and on raw volume it beats ours. As of July 2026 the free rung on Aptabase's own pricing slider is 20,000 events per month, with unlimited apps listed among the included features. The Privytics free tier is 10,000 events per month as of July 2026, covering one project, keeping data for 12 months, and requiring no card. If free event volume is the deciding factor, Aptabase takes that row outright; the trade is that those events cannot be turned into funnels, retention or cohorts.

### How much does Aptabase cost?

Aptabase uses event-based tiers set through a slider on aptabase.com, with the free plan at the bottom of the ladder. As of July 2026 that ladder runs USD 10 for 200,000 events per month, USD 20 for 1M, USD 40 for 2M, USD 75 for 5M, USD 140 for 10M, USD 240 for 20M and USD 450 for 50M, with a contact-us step above that. The slider renders its figures dynamically, so confirm current numbers on aptabase.com. It does not charge overages: its own FAQ says you will not be charged overage fees and that analytics are temporarily disabled until the start of the next month if you pass your plan's limit. Privytics publishes stepped tiers too, as of July 2026: EUR 10 for 100k events, EUR 20 for 500k, EUR 40 for 1M, EUR 100 for 5M, and EUR 200 for 10M per month, ex VAT, with custom pricing above 10M. Privytics paid plans add session replay and 5-year event history. Per event, Aptabase is the cheaper of the two at most rungs; per feature, it does less.

### Can Privytics replace Aptabase?

It depends on the job. For web plus product analytics with funnels, retention, cohorts, per-user profiles, and session replay, Privytics does things Aptabase deliberately does not. Privytics also ships React Native, Swift, and Kotlin SDKs, so it can track mobile apps. But if you need app-runtime SDKs like Tauri, Electron, Unity, Unreal, or .NET MAUI, or you need to self-host the product itself, Aptabase is the better tool and Privytics is not a clean replacement. Aptabase also has the longer public track record, so where that weighs heavily, it stays ahead for now.

### Is Aptabase open source?

Yes, and fully so for what you run. The Aptabase core (backend and dashboard) is licensed AGPLv3, and its SDKs are MIT-licensed, with an official self-hosting option. Privytics is built on OpenPanel, which is also AGPL, but Privytics operates that engine as a managed EU service rather than shipping a self-host distribution under its own name.

### Is my data anonymous with either tool?

With Aptabase, by design there are no user identifiers at all: no cookies, no device IDs, no fingerprinting, and no long-term identity, which is why it cannot compute retention or cohorts. Privytics is cookieless too, using a daily-rotating salted-hash visitor id so nothing is written to the device, and it adds optional per-user Profiles only when you call `identify()`. Session replay, on paid plans, is opt-in per project and masks all text and inputs by default. Both avoid the consent-banner problem in the anonymous case; they simply draw the identity line in different places.

## Trying Privytics

If your use case is app-first, open-source, and self-hosted, start with Aptabase; it is built for exactly that and it has the track record to back it up. If you want cookieless, EU-hosted product analytics that spans web and app in one managed service, with funnels, retention, cohorts, per-user profiles, and session replay, Privytics is worth a look. The free tier is 10,000 events per month for one project, with no card and 12-month retention, so you can wire up the SDK for your stack and see real numbers before committing to anything. We would rather you pick the tool that fits, and for a fair number of app developers that tool is Aptabase.
