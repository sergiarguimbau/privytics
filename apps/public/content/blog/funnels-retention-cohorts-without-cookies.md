---
slug: funnels-retention-cohorts-without-cookies
title: "How funnels, retention and cohorts work without cookies"
description: "Funnels, retention and cohorts without a cookie: how daily-rotating anonymous ids and opt-in identify() link events to a person, and the real tradeoffs."
date: 2026-07-22
updated: 2026-07-29
tag: Guide
---

Most teams think they have to choose between two things: real product analytics (funnels, retention, cohorts, per-user profiles) and staying off the consent-banner treadmill. The tools that do the deep behavioral reporting tend to set a persistent identifier, which triggers a cookie banner under EU law. The tools that skip the banner tend to be web analytics: pageviews, sources, top pages, and not much else.

Cookieless product analytics is the attempt to have both. This guide explains what that actually means, how funnels, retention and cohorts work when nothing is stored on the visitor's device, and where the approach genuinely falls short. Privytics is built this way, so we have an interest here, but the point of the piece is to be accurate about the tradeoff rather than to sell past it.

*Competitor features, pricing and the consent framing were last reviewed 2026-07-29. Tools change fast, and this is not legal advice, so verify current figures and your own obligations before acting.*

## What "cookieless" actually triggers, and what it doesn't

The consent banner is not caused by "using personal data." Under the EU ePrivacy Directive (the so-called cookie law), the thing that requires consent is **storing or reading information on the user's device**. A tracking cookie or a persistent id in localStorage is exactly that. Remove the on-device identifier and the specific legal trigger for the banner goes away.

That is the whole mechanism. [Cookieless analytics](/blog/what-is-cookieless-analytics) does not mean "no data." It means the identifier that ties a visitor's actions together is derived on the server instead of stored in the browser.

Privytics builds an anonymous visitor id by taking the IP address, the user agent and the project id, then running them through a salted hash. The salt rotates at midnight UTC. The raw IP is never stored, nothing is written to the device, and tomorrow the same visitor produces a different id. For the anonymous case that removes the need for a cookie consent banner. You still process an IP server-side for a moment, so you still need a lawful basis and a privacy policy, but you are not asking every visitor to click "Accept" before you can count them.

Two honest caveats up front. First, this is the standard argument that Plausible and Fathom also make, and it is widely relied on in practice, but it remains a legal interpretation rather than settled universal fact. Second, the moment you call `identify()` with your own user id (covered below), you are doing something more than anonymous counting, and you take on the responsibility that comes with it.

## Linking events to a person without a cookie

Product analytics needs to answer questions like "of the people who added an item, how many checked out" and "of the users who signed up in March, how many came back in week four." Both require linking multiple events to the same person. Here is how that happens with no cookie.

### Anonymous sessions

Within a visit, every event carries the daily-rotating hash. That is enough to stitch a **single session** together: view product, add to cart, start checkout, all sharing one id. A funnel that a logged-out user completes in one sitting is captured accurately, and so are same-day session reports.

### Identified users, opt-in

To follow a real person across sessions and across devices, you call `identify()` and pass **your own stable user id**, typically the id from your database once someone logs in or signs up. From that point their events attach to that id regardless of browser, device or day. This is opt-in by design: you decide when a user is identified, usually at authentication, and you control the id. Cross-session funnels, multi-week retention curves, acquisition and behavioral cohorts, and per-user Profiles all run on this identified layer.

The practical shape this gives you: **anonymous data is good for same-session behavior and top-of-funnel volume, identified data is where the durable product-analytics reporting lives.** For most [SaaS and app teams](/for/saas) that maps cleanly onto reality, because the behavior you care about most (activation, retention, feature adoption) happens after someone has an account.

## How the three approaches compare

| | Pageview privacy tools | Cookie-based product analytics | Cookieless product analytics (Privytics) |
|---|---|---|---|
| Examples | Plausible, Fathom, Umami | Mixpanel, Amplitude, PostHog (cloud default) | Privytics |
| Consent banner for anonymous use | Generally not required | Usually required | Generally not required |
| Full funnels / retention / cohorts | Partial, varies by tool | Yes | Yes |
| Per-user Profiles | No | Yes | Yes |
| Cross-device for logged-in users | Generally no | Yes | Yes, via identify() |
| Anonymous multi-day stitching | Limited | Yes (persistent id) | Limited (daily-rotating hash) |
| Primary data location | EU options common | US by default, EU regions available | EU (Germany) |

## Pageview privacy tools (Plausible, Fathom, Umami)

These already solved the cookieless part, and they deserve credit for it. They are lightweight, privacy-first, and most run without a consent banner in the same way Privytics does. If your question is "how much traffic, from where, to which pages," they are excellent and often the right pick.

Where they stop is depth. They were built as web analytics, and product analytics was added later, unevenly. Umami's docs now cover funnels, user journeys and retention. Plausible lists funnels and user journeys on its Business plan, as of July 2026. Fathom stays closer to pageviews, events and goals. What none of them really offer is the full product-analytics toolkit: per-user Profiles you can open and inspect, behavioral cohorts (group users by an action, then watch their retention), and identify-based cross-device analysis of individual accounts. If a funnel report is the only thing missing from your setup, a pageview tool that has funnels may be enough. If you need to reason about users as people over time, that is a different category of tool.

## Cookie-based product analytics (Mixpanel, Amplitude, PostHog)

This is the mature end of the market. Mixpanel and Amplitude have deep, battle-tested funnels, retention, cohorts, and behavioral segmentation, plus years of features around them. If you have the budget and the appetite for a consent banner, they are strong tools and this post is not going to pretend otherwise. If Mixpanel in particular is the tool you are weighing, our [round-up of Mixpanel alternatives](/blog/mixpanel-alternatives-2026) covers that field in more detail than this piece can.

The two costs are the ones you would expect. First, consent: their default is a persistent identifier stored on the device, which is the exact thing that requires a cookie banner in the EU, so a meaningful share of anonymous visitors either never opt in or get counted with reduced fidelity. Some can be run in a cookieless or memory-only mode. PostHog goes furthest here, with a documented `cookieless_mode` setting and a Cloud EU region in Frankfurt, and its docs are candid about the cost: session replay and surveys switch off for visitors who have not consented, GeoIP enrichment stops, and a daily-rotating salt makes returning visitors look new each day. That last limit is the same one we describe below, and it is the honest crux of [how we compare with PostHog](/blog/privytics-vs-posthog). Second, data location: EU residency is available across these tools but is not usually the default. Mixpanel documents US servers as its default and asks you to pick EU data residency when a project is created, so the out-of-the-box path for EU teams leans on transfer mechanisms rather than keeping data in the EU.

The important honest point: for a **logged-out visitor whose journey spans several days**, cookie-based tools capture more than a cookieless tool can, because the persistent id survives across days without anyone logging in. That is a real advantage, not a rounding error, and it is exactly what you are giving up by going cookieless.

## Where Privytics fits

Privytics is managed, cookieless, EU-hosted product analytics built on the open-source OpenPanel engine (AGPL-3.0). It is an independent service, not affiliated with, endorsed by or sponsored by OpenPanel. It runs the full product-analytics set: custom events, funnels, retention, cohorts, dashboards, per-user Profiles, and a REST API. The anonymous layer uses the daily-rotating salted hash so you skip the consent banner, and the identified layer uses your own user id via `identify()` for cross-session and cross-device reporting.

It fits best when your core analytics questions are about logged-in behavior and you would rather not run a banner: activation funnels after signup, weekly and monthly retention curves, behavioral cohorts to find your activation lever, and Profiles to inspect an individual account. For that shape of problem you get most of what Mixpanel or Amplitude give you, without the consent overhead, with analytics data kept in Germany.

Pricing is stepped by event volume rather than metered per event. The free tier is 10,000 events per month with one project, no credit card and 12-month retention. Paid runs EUR 10 for 100k, EUR 20 for 500k, EUR 40 for 1M, EUR 100 for 5M, and EUR 200 for 10M events per month (ex VAT), with custom pricing above that. Paid plans add session replay and 5-year event history.

## The honest limits of going cookieless

Cookieless product analytics is a real tradeoff, not a free lunch. Four limits are worth knowing before you commit.

**Anonymous cross-day stitching is limited.** Because the salt rotates daily, a logged-out visitor is effectively a new anonymous id each day. A funnel or retention question that depends on tracking the *same anonymous person* across multiple days will undercount, because there is no persistent device identifier to hold them together. If your product's key journey happens over days while the user is logged out (a long consideration purchase, an anonymous multi-visit browsing pattern), a cookie-based tool will capture that better. This is the single biggest reason to pick something else.

**Depth of identified analysis depends on you calling identify().** The strong reporting lives on the identified layer, so if you never call `identify()`, you are running closer to a very good session-and-volume tool than a full product-analytics stack.

**Privytics is a newer service than Mixpanel, Amplitude or PostHog, which have been operating for years.** It does not have the same accumulated feature depth or the same catalogue of integrations. If a large ecosystem matters to you today, that gap is a legitimate reason to choose an established tool.

**It is [product analytics, not web analytics](/blog/product-analytics-vs-web-analytics).** It is not the tool for pure marketing-site pageview reporting, and above 10,000 events per month it is a paid product, so very high-volume free usage is not the model.

## When another tool is the better choice

- **You mostly need pageviews, sources and top pages.** A pageview privacy tool like Plausible, Fathom or Umami is simpler and often cheaper for that job.
- **Your critical funnel is a logged-out, multi-day journey.** Cookie-based product analytics will stitch anonymous visitors across days in a way cookieless cannot, and that accuracy may matter more than skipping the banner.
- **You need deep integrations or a big feature surface today.** Established tools have years of maturity behind them, and Privytics is the newer option.
- **You are comfortable running a consent banner and want the deepest possible behavioral tooling.** Amplitude and Mixpanel remain the reference standard.
- **You want US hosting or a specific cloud region Privytics does not offer.** EU-only hosting is a feature for some teams and a constraint for others.

## FAQ

### Is cookieless product analytics GDPR-safe by default?

It removes the specific trigger for a cookie consent banner, because nothing is stored or read on the visitor's device. You still process an IP server-side to derive the hash, so you still need a lawful basis (typically legitimate interest) and a privacy policy, and once you call `identify()` you are handling your own user ids and take on the matching responsibility. It reduces your consent surface, it does not erase your obligations. Confirm your own case with counsel.

### Can I really run funnels and retention without any cookie?

Yes. Within a session the daily-rotating hash links events, so single-session funnels work anonymously. Cross-session and cross-device funnels, retention curves and cohorts run on the identified layer once you call `identify()` with your own user id. The reporting itself is the same, only the identifier source is different.

### What does identify() actually do, and is it opt-in?

You call it with a stable user id from your own system, usually right after login or signup, and from then on that user's events attach to that id across browsers, days and devices. It is opt-in in the sense that you choose when a user becomes identified and you own the id. Anonymous visitors stay anonymous until you make that call.

### Where is the data stored?

Analytics event data is stored in Germany, in the EU. The service is operated from Spain, and billing runs through Polar as merchant of record. The engine is the open-source OpenPanel project (AGPL-3.0) and Privytics is a managed, independent service built on it, so you are not running servers yourself.

### How does the free tier compare with pageview analytics tools?

Privytics is free up to 10,000 events per month, with one project, no credit card and 12-month retention. That covers a small product comfortably, but it counts events rather than pageviews, so a busy app reaches the limit faster than the same traffic would on a pageview tool. Above it, the stepped plans start at EUR 10 for 100k events per month.

## Trying Privytics

If your analytics questions are mostly about what logged-in users do, and you would rather not run a consent banner or store your analytics data in the US, [cookieless product analytics](/) is worth a look, and Privytics is a straightforward way to try it. The free tier (10,000 events per month, no credit card, 12-month retention) is enough to instrument a real product, add a few funnels, wire up `identify()` at login, and see whether the identified-layer reporting covers what you need.

Just go in with the tradeoff in mind. If your make-or-break funnel is a logged-out, multi-day journey, or you need the maturity and scale of an established tool today, one of the alternatives above is the more honest fit, and we would rather tell you that now than after you have migrated.
