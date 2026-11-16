---
slug: product-analytics-vs-web-analytics
title: "Product analytics vs web analytics: what is the difference?"
description: "Product analytics vs web analytics: web analytics counts pageviews and sources, product analytics tracks events, funnels, and retention. How to pick."
date: 2026-07-22
updated: 2026-07-29
tag: Guide
---

Analytics tools split into two families that answer different questions. Web analytics tells you how people arrive and what pages they see. Product analytics tells you what people do once they are inside your app and whether they come back. The names get used interchangeably, which leads to teams buying the wrong tool, then either drowning in setup they do not need or missing the exact reports they wanted.

This post draws the line clearly, shows which tools sit on each side, and is honest about a common truth: plenty of sites only ever need web analytics, and reaching for product analytics is overkill for them.

*Competitor details checked 2026-07-29. Verify current figures and features before acting.*

## What web analytics measures

Web analytics is built around the page and the visit. The core questions are: how many people came, where did they come from, and what did they look at. The standard metrics are pageviews, sessions, unique visitors, bounce rate, traffic sources, top pages, and countries.

This is the right lens for a marketing site, a blog, a documentation portal, or any content where the goal is traffic and reach. You want to know that a Reddit post sent 4,000 visitors, that half of them landed on the pricing page, and that organic search is growing month over month. You do not need to know what each individual did across three visits.

Typical web analytics tools: Google Analytics, Plausible, Fathom, Simple Analytics, Umami. The privacy-first ones in that list are [cookieless](/blog/what-is-cookieless-analytics) and deliberately lightweight, giving you clean pageview reporting without a full event model to design and maintain. The lines do blur at the edges: Plausible lists funnels and user journeys on its Business plan, and Umami documents funnel, retention, and journey reports, so a couple of these are inching toward product analytics.

## What product analytics measures

Product analytics is built around the user and the action, not the page. Instead of "which pages got viewed," it asks "did the user complete signup, invite a teammate, and return the next week." The core building blocks are:

- **Custom events**: named actions like `signup_completed`, `project_created`, `plan_upgraded`, each with properties.
- **Funnels**: ordered steps, so you can see where people drop out between viewing pricing and finishing checkout.
- **Retention**: whether users who did something in week one came back in weeks two, three, and four.
- **Cohorts**: groups of users defined by behaviour or properties, tracked over time.
- **Per-user journeys**: the timeline of one person's events across sessions and devices.

This is the right lens for a [SaaS app](/for/saas), a mobile app, an onboarding flow, or anything where the value is in what users repeatedly do, not in raw traffic. Pageviews barely matter here. Whether a cohort activates and sticks is the whole game. How those reports are built [without cookies](/blog/funnels-retention-cohorts-without-cookies) is a topic of its own.

Typical product analytics tools: Mixpanel, Amplitude, PostHog, Heap (now part of Contentsquare), and Privytics.

## Comparison table

| | Web analytics | Product analytics |
|---|---|---|
| Core unit | Page and session | User and event |
| Main question | How do people find and browse the site | What do people do and do they come back |
| Key metrics | Pageviews, sessions, sources, top pages, bounce | Custom events, funnels, retention, cohorts |
| Best for | Marketing sites, blogs, docs | Apps, SaaS, onboarding, checkout |
| Setup effort | Drop in a script | Script plus events you define |
| Example tools | GA4, Plausible, Fathom | Mixpanel, Amplitude, PostHog, Privytics |

The row that trips people up is setup effort. Web analytics works the moment the script loads. Product analytics only pays off after you decide which events matter and instrument them, which is real work. If nobody on the team will define and maintain events, product analytics turns into an empty dashboard.

## Google Analytics (and the blurry middle)

Google Analytics 4 muddies the split on purpose. It started as web analytics but moved to an event-based model, so it can track custom events and build basic funnels and retention reports. In theory it does both.

In practice GA4 is a heavy tool that most people use as web analytics with extra steps. Its funnel and path exploration reports exist but are clunky compared to a dedicated product tool, the interface is famously hard, sampling can kick in once a query passes Google's documented event quota on standard properties, and the standard setup relies on cookies, which means a consent banner in the EU. It is free and ubiquitous, so it remains the default. If you want proper product analytics though, GA4 is rarely where teams land.

## Plausible and Fathom (mostly web analytics)

Plausible and Fathom are the clean end of web analytics. Cookieless, privacy-first, one lightweight script, a single readable dashboard of pageviews, sources, and top pages. Both are excellent at what they do and make little pretense of being full product tools.

They do support custom events and simple goal conversions, so you can track a signup click or a button press, and Fathom can attach revenue values to those events. Plausible goes a step further with funnels and basic user journeys on its Business plan, but neither tool offers retention cohorts, and Fathom's published feature list stops at pageviews, sources, events, and goals. That restraint is by design. If those two are your shortlist, [Plausible and Fathom differ more on pricing shape and reporting depth](/blog/plausible-vs-fathom) than on privacy posture. If your site is content and your question is "how much traffic and from where," these are often the best answer, and they are usually cheaper and simpler than a full product analytics tool.

## Mixpanel, Amplitude, and PostHog (product analytics)

These are the heavyweights of product analytics.

- **Mixpanel** is the classic event-and-funnel tool, strong on reports and easy for non-technical teams once events exist.
- **Amplitude** goes deeper on behavioural cohorts and analysis, and is common in larger product orgs.
- **PostHog** bundles product analytics with session replay, feature flags, and experiments, aimed at engineering teams that want one platform. It is open source, though its own docs describe self-hosted deployments as officially unsupported and point teams to its cloud once volumes grow.

All three do the full set: custom events, funnels, retention, cohorts, per-user profiles. The tradeoffs are cost and complexity. Free tiers exist, and PostHog's in particular is generous, but paid pricing scales with event or user volume and can jump sharply. Their clouds are US-hosted by default, though PostHog offers an EU Cloud in Frankfurt, which EU teams should weigh. They are powerful and mature. They are also more than a small team measuring one onboarding flow usually needs.

## Where Privytics fits

Privytics is product analytics: custom events, funnels, retention, cohorts, dashboards, per-user Profiles, and a REST API, built on the open-source OpenPanel engine (AGPL-3.0). Privytics is an independent service and is not affiliated with, endorsed by, or sponsored by OpenPanel. Two things make it different from the tools above.

First, it is cookieless. The anonymous visitor id is a daily-rotating salted hash of IP, user agent, and project id, with the salt rotating at midnight UTC, and nothing is written to the device. For anonymous tracking that means [no consent banner](/blog/cookieless-analytics-gdpr-cookie-banner). Cross-session and cross-device identity is opt-in through `identify()` with your own user id, so you decide when a user becomes identified.

Second, analytics event data is stored in EU data centres in Germany. The free tier is 10,000 events per month on one project, with no credit card and 12-month retention. Paid plans are stepped tiers rather than usage meters, as of July 2026: EUR 10 for 100k events, EUR 20 for 500k, EUR 40 for 1M, EUR 100 for 5M, EUR 200 for 10M per month, ex VAT, and custom pricing above that. Paid adds session replay and 5-year event history.

Two caveats worth stating. Privytics is a newer service than Mixpanel and Amplitude, which have been operating for years, so it does not match their integration catalogue. And it is product analytics, not web analytics: it can report pageviews, but if a pageview dashboard is all you want, a dedicated web analytics tool is a simpler fit.

## When another tool is the better choice

Honestly, most of the time the answer is not us.

- **You only need pageviews and sources.** A marketing site or blog is better served by Plausible or Fathom. They are cheaper, simpler, and purpose-built for that question. Do not buy product analytics you will not instrument.
- **You are deep in the Google ecosystem.** If you live in Google Ads and Search Console and want free attribution, GA4 fits that workflow in a way an independent tool will not.
- **You want an all-in-one product platform.** If you need product analytics plus feature flags plus experiments in one place, PostHog is designed for that and Privytics is not.
- **You are past 10 million events a month or need enterprise procurement.** Above 10 million events Privytics moves to custom pricing, so the numbers stop being self-serve. If your purchase has to go through a formal vendor review with signed SLAs, a negotiated enterprise contract with Amplitude or a self-hosted PostHog is the better-trodden path.

Pick the tool that matches the question you actually have.

## FAQ

### Do I need both web analytics and product analytics?

Sometimes, but usually not at first. A content site needs only web analytics. An early app needs only product analytics for its core flows. Larger teams often run both: a web tool for the marketing site and a product tool for the app. Start with the one that answers your most pressing question and add the second only when a real gap appears.

### Can product analytics tools measure pageviews too?

Yes. A pageview is just an event, so most product analytics tools, Privytics included, can record and report them. The reverse is only partly true: pure web analytics tools like Fathom do not offer funnels or retention cohorts, and Plausible lists funnels on its Business plan. The difference is emphasis: product tools bury pageviews under behavioural analysis, so they feel heavier if pageviews are all you want.

### Is Google Analytics product or web analytics?

Both, sort of. GA4 uses an event model and can do basic funnels and retention, so it crosses into product analytics. In practice most teams use it as web analytics because its product reports are harder to use than dedicated tools, and its cookie-based setup usually needs a consent banner in the EU.

### Which type needs a cookie consent banner?

It depends on the tool, not the category. Cookie-based tools like standard GA4 need a banner in the EU. Cookieless tools, whether web analytics like Plausible or product analytics like Privytics, avoid device storage, so the anonymous case generally needs no banner. Once you identify users by your own id, you take on the usual privacy obligations regardless of tool.

### Is product analytics harder to set up?

Yes. A web analytics script starts reporting on its own. Product analytics needs someone to decide which actions matter, name them, add the calls in your code, and keep them accurate as the product changes. That is ongoing work, so if nobody will own event definitions, web analytics is the safer choice.

### Which one is cheaper?

Web analytics, generally. Privacy-first web tools are inexpensive, though their pricing still scales with pageviews. Product analytics scales with event or user volume and can climb faster. Privytics is free up to 10,000 events a month and then moves through stepped tiers starting at EUR 10, so the bill only changes when you cross a tier. If budget is tight and you only need pageviews, web analytics wins on price.

## Trying Privytics

If your question is behavioural, whether users activate, convert through a funnel, and come back, and you want that without cookies and with the data stored in Germany, Privytics is worth a look. The free tier is 10,000 events a month with no credit card and 12-month retention, which is enough to instrument a real onboarding flow and see whether the numbers tell you anything useful.

If your question is really just traffic and sources, we will say it plainly: use Plausible or Fathom instead. Buying product analytics for a content site is effort you will not get back. Match the tool to the question, and only reach for product analytics when the page stops being the thing you care about and the user starts being it.
