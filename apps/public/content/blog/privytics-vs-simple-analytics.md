---
slug: privytics-vs-simple-analytics
title: "Privytics vs Simple Analytics: Web and Product Analytics Compared"
description: "Privytics vs Simple Analytics compared: cookieless tracking, EU hosting, pricing, funnels and retention, and which one fits your site or product."
date: 2026-07-22
updated: 2026-07-29
tag: Comparison
---

Privytics and Simple Analytics are both cookieless and both keep their data in the EU, which makes this one of the fairer fights in the privacy analytics space. The honest split is scope. Simple Analytics is a mature, proven web analytics tool: pageviews, visitors, referrers, top pages, plus custom events and goals, in a deliberately minimal dashboard, hosted in the Netherlands and running since 2018. Privytics is a product analytics service built on the open-source OpenPanel engine: funnels, retention, cohorts, user profiles and custom events, with a permanent free tier and analytics data stored in Germany. If you want traffic reporting from an established EU vendor without a cookie banner, Simple Analytics is the safer pick. If you need to see how users move through a product over several steps, Simple Analytics does not do that, on purpose.

## The short version

Simple Analytics is an established, bootstrapped Dutch product (Simple Analytics B.V., Amsterdam), [founded in 2018 by Adriaan van Rossum](https://www.simpleanalytics.com/press/founder-story), with years of operating history, a strong Netherlands data-residency story and an AI insights layer. It is web analytics, and it stays deliberately narrow: no funnels, retention, cohorts or user-level analysis, by design rather than by omission. Privytics is a newer service than Simple Analytics, which has been operating for years. What Privytics adds is product analytics, native app SDKs, a permanent free tier and an AGPL engine you can self-host. Choose by the job: reporting on a website's traffic, or analysing behaviour inside a product.

Simple Analytics details were checked on 2026-07-29 against its own site, so every figure below is accurate as of July 2026; verify current figures before acting. Nothing here is legal advice.

## Feature and pricing comparison

| Attribute | Privytics | Simple Analytics |
| --- | --- | --- |
| Category | Product analytics | Web analytics (deliberately minimal) |
| Free tier | 10,000 events/month, no card, 1 project, no badge | Free-forever: 1 user, 5 websites, 30-day history, unlimited pageviews subject to a fair use policy, requires a badge, no card. Plus a 14-day full trial |
| Entry paid price (as of July 2026) | EUR 10/month for 100k events (ex VAT) | EUR 20/month self-serve at 100k pageviews, annual billing gives 2 months free |
| Paid scaling (as of July 2026) | Stepped by events: EUR 20/500k, EUR 40/1M, EUR 100/5M, EUR 200/10M, custom above | Slider by pageviews, 100k to 2.5M/month; extra users EUR 20/month each |
| Enterprise | Custom above 10M events | Custom quote; the pricing page lists SSO, role-based access, SOC 2 compliance, an SLA, raw data export, Looker Studio and priority support |
| Billing unit | Events | Pageviews (plus events and goals) |
| Operating entity | Independent European service, operated from Spain | Simple Analytics B.V., Amsterdam, Netherlands |
| Operating history | Newer service, built on the established open-source OpenPanel engine | Since 2018, bootstrapped, no VC |
| Cookies | None, no device storage | None, no cookies, no PII |
| Data location | Germany (EU) | Netherlands, EU providers only, states it is not subject to US law |
| Funnels | Yes | No |
| Retention and cohorts | Yes | No |
| User profiles and user-level analysis | Yes, via `identify()` with your own IDs | No, anonymous only |
| Session replay | Yes, opt-in per project, paid plans only | No |
| AI assistant | Yes, on paid plans (chat, report drafting, insight explanations) | Yes, plain-English insights, comparisons, generated charts |
| Native app SDKs | Swift, Kotlin, React Native and more | Web tracking script; GA import offered |
| Data retention | 12 months free, 5 years paid | 30-day history on free; on paid, its docs say data is kept while the account is active, with no fixed window published |
| Open source | Yes, built on the AGPL-3.0 OpenPanel engine (full platform is open source) | Tracking scripts only on GitHub; core platform proprietary |
| Self-hosting | Yes, the same AGPL engine | No |

Simple Analytics prices and plan limits were read from [simpleanalytics.com/pricing](https://www.simpleanalytics.com/pricing) on 2026-07-29 and are stated as of July 2026. One caution worth flagging: several third-party review sites still list an older Starter (about $19/month) and Business (about $59/month) structure. The official page now shows the Free tier, a single EUR 20 self-serve slider and Enterprise, so treat those older third-party figures as outdated and confirm against the source. Slider prices above the EUR 20 entry point are calculated on the page by pageview volume, so we have not quoted intermediate steps we cannot cite.

## Web analytics versus product analytics

This is the whole comparison in one line. Simple Analytics answers "how much traffic, from where, on which pages, and did my goals fire?" Privytics answers that too, and also "which users came back in week four, and where did the ones who churned drop off?"

Simple Analytics is clear that the minimal scope is the point. It gives you pageviews, visitors, referrers and traffic sources, top pages, and custom events and goals, presented in a single readable dashboard, with a GA import path if you are migrating. What it does not have is any way to chain events into a multi-step funnel with drop-off rates, group users into cohorts, measure retention over time, or inspect an individual user's journey. That is a category boundary, not a hidden gap. The product is built to hold no user-level identifiers, and that stance is exactly what makes those product-analytics views impossible. If you are not sure which camp you are in, we go through the split in [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics).

Privytics inherits the OpenPanel engine's product analytics model: custom events, user profiles once you call `identify()`, funnels, retention curves, cohorts and dashboards, plus a REST API. If your questions are about logged-in behaviour inside an app or SaaS, that difference matters more than anything else on this page. If your questions are about a marketing site or a blog, Privytics is more machinery than you need and Simple Analytics is the cleaner fit.

There is also a reach difference. Simple Analytics is web analytics driven by a tracking script; Privytics works with SDKs for Swift, Kotlin, [React Native](/for/react-native) and the usual web frameworks, so it can measure a mobile app the same way it measures a website. If your product lives partly or wholly in an app, that is a real point in Privytics' favour.

## Where the data lives and who runs each service

Both tools give you an EU story, but they are not identical.

Simple Analytics has the stronger data-residency narrative of the two. It is a Dutch company, Simple Analytics B.V. in Amsterdam, and it states that all data is processed and stored exclusively in EU data centres in the Netherlands, operated by EU providers, and that the company is not subject to US law. For a buyer whose diligence turns on jurisdiction rather than just physical location, an EU-incorporated vendor with EU-only providers is a clean answer.

Privytics stores analytics event data with an EU data-centre provider in Germany. It is an independent European service operated from Spain, which is also EU, but its sub-processor list includes US-based services such as Polar for billing and Resend for email. That is normal for a small SaaS, and it is not the same as Simple Analytics' "everything in the Netherlands, not subject to US law" posture.

Simple Analytics also has the longer operating history: since 2018, bootstrapped, with no VC pressure to change direction. If a long public track record is part of your selection criteria, that weighs in its favour.

## Open source, or only the tracking script

Both tools sit near the open-source world, but only one is actually an open-source product.

Simple Analytics publishes its client-side tracking and auto-events scripts on GitHub as public source, which is useful if you want to read exactly what runs in your visitors' browsers. The core platform and backend, though, are proprietary. So describe Simple Analytics accurately: the script is open, the product is not. That is a perfectly reasonable commercial model, and it does not make the tool less private, but it does mean you cannot self-host it, fork it, or leave with the whole system if the vendor changes direction.

Privytics is built on OpenPanel, whose full platform is open source under AGPL-3.0. Because the engine is AGPL and self-hostable, running it yourself is always available as an exit: if the managed service disappoints, or simply disappears, you can stand up the same engine on your own infrastructure. Privytics is an independent service and is not affiliated with, endorsed by or sponsored by OpenPanel. If licence terms and a self-hosting escape hatch are part of your decision, that is a genuine advantage for Privytics; if they are not, it changes nothing about the day-to-day product.

## The AI assistant and automated event tracking

Simple Analytics has invested recently in an AI insights layer. You can ask questions about your data in plain English and get insights, charts, period comparisons and recommendations, and it will even generate social-media images from your stats. It also ships automated event tracking that captures common interactions without manual instrumentation. For a small team that wants a readable summary of what happened last week without building reports, that is a real, shipped feature.

Privytics now has an AI assistant on paid plans: you ask questions in plain English and it answers from your project's data, drafts reports and explains detected changes. Every plan also gets a short AI-written summary in the weekly digest email. Those AI requests go to OpenAI and are processed outside the EU, including in the US, as our [privacy policy](/privacy) explains. The bets are still different. Simple Analytics is betting that most site owners want a fast, plain-language read on aggregate traffic. Privytics is betting that product teams want the deeper analytical surface, the funnels, cohorts and profiles, with the assistant as one way into it. Simple Analytics has the edge on maturity here: its AI layer has been in use longer, on a proven platform.

## When Simple Analytics is the better choice

Be honest with yourself about what you actually need. Pick Simple Analytics if any of these describe you.

- **You want web analytics, not product analytics.** If the questions are "which posts get traffic", "which sources convert" and "did my goals fire", Simple Analytics answers them well in a dashboard a non-analyst can read in a minute. Privytics gives you more surface area than you need. If you are shortlisting minimal web analytics tools generally, [Plausible and Fathom](/blog/plausible-vs-fathom) are the other two names that come up at this end of the market.
- **You want a vendor with a long track record.** Simple Analytics has operated since 2018, is bootstrapped and has paid support tiers. Privytics is a newer service with community support and no SLA on the free tier.
- **You want the strongest EU and Netherlands data-residency story.** An EU-incorporated company with EU-only providers, storing everything in the Netherlands and stating it is not subject to US law, is a cleaner jurisdictional answer than an independent service operated from Spain whose sub-processor list includes US services.
- **You want a plain-language AI read on your traffic.** Simple Analytics' AI insights layer has been shipping longer and is built around exactly that, and it adds automated event tracking. Privytics' AI assistant is newer and available on paid plans only.
- **You are migrating from Google Analytics for a website.** Simple Analytics offers GA import and is designed to replace exactly that reporting, minus the cookies and the banner. If your GA setup was more than traffic reporting, our [GA4 migration guide](/blog/migrate-from-google-analytics-ga4-cookieless) covers what does and does not carry over.

Those are real reasons, and if several apply, Simple Analytics is likely the right call regardless of what Privytics adds on top.

## FAQ

### Does Simple Analytics have a free plan?

Yes, checked 2026-07-29 and accurate as of July 2026. There is a free-forever tier: one user, five websites, 30 days of history and unlimited pageviews subject to a fair use policy, with no credit card required, but it requires displaying a Simple Analytics badge on your site. There is also a 14-day full-feature trial of the paid plan. Privytics has a permanent free tier of 10,000 events per month with one project, no badge and no card required.

### How much does Simple Analytics cost?

Checked 2026-07-29 on [simpleanalytics.com/pricing](https://www.simpleanalytics.com/pricing), so these are the figures as of July 2026: a free-forever tier, a self-serve plan at EUR 20 per month (annual billing gives two months free) that scales by a pageview slider from 100k to 2.5M pageviews per month with additional users at EUR 20 each, and a custom-quote Enterprise plan whose listed additions are SSO, role-based access, SOC 2 compliance, an SLA, raw data export, Looker Studio and priority support. Some third-party sites still list older tiers around $19 and $59; treat those as outdated against the official page.

### Is Simple Analytics open source?

Not as a product. Its client-side tracking and auto-events scripts are published on GitHub, so you can read what runs in the browser, but the core platform and backend are proprietary and cannot be self-hosted. Privytics is built on the AGPL-3.0 OpenPanel engine, whose full source is public and can be self-hosted.

### Can Privytics replace Simple Analytics?

For the website-traffic questions, Privytics covers dashboards and custom events and adds funnels, retention, cohorts and profiles that Simple Analytics does not have. What you give up is Simple Analytics' years of operating history, its especially minimal one-screen dashboard, its GA import and its stronger Netherlands residency posture. If all you want is simple, proven web stats, Privytics may be more tool than you need.

### Do I need a cookie banner with either tool?

Both are cookieless by design, set no identifiers on the visitor's device and collect no PII, which is the basis for both vendors' position that no consent popup is required. The underlying mechanics, and why they matter for consent, are covered in [what is cookieless analytics](/blog/what-is-cookieless-analytics). That is a legal reading, not a regulator's ruling, and neither tool makes you GDPR compliant on its own. You remain the data controller and are responsible for your own assessment in your jurisdiction. Privytics also supports consent gating if you want it: initialise with `disabled: true` and call `ready()` once a visitor has consented. None of this is legal advice.

## Trying Privytics

If Simple Analytics already answers your questions, and you value a proven EU vendor with an AI insights layer over funnels and cohorts, stay with it; that is a sound choice. If you have hit the wall where aggregate traffic stops being enough and you need to see drop-off across a multi-step flow, retention over time, or behaviour inside a mobile app, Privytics has a permanent free tier: 10,000 events per month, one project, 12 months of retention, no badge and no credit card. Export your data any time, and because the engine is AGPL you can self-host it whenever you like.
