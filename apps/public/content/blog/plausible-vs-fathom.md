---
slug: plausible-vs-fathom
title: "Plausible vs Fathom (2026): An Honest Comparison"
description: Plausible vs Fathom compared on pricing, sites, EU data residency, self-hosting, API and features, with verified July 2026 figures and a neutral verdict.
date: 2026-07-29
updated: 2026-07-29
tag: Comparison
---

Plausible and Fathom are the two best-known privacy-first web analytics tools, and they are more alike than different: both are cookieless, both say you do not need a consent banner, neither has a free tier, and both deliberately stop at website traffic. Plausible is open source, EU-owned and EU-hosted, cheapest for one or two sites, and the only one of the two with funnels. Fathom is a closed-source managed service run from Canada, with EU isolation on by default, at least 50 sites bundled into every plan, and no data expiry while you remain a customer.

*Figures checked on 2026-07-29 against each vendor's own pricing pages and documentation. Prices are as of July 2026 and change often. Nothing here is legal advice. We build a competing product, Privytics, and it gets one clearly marked section near the end.*

## Plausible vs Fathom at a glance

| Attribute | Plausible | Fathom |
| --- | --- | --- |
| Company base | EU, incorporated in Estonia | Canadian corporation |
| Free plan | None on cloud | None |
| Trial | 30 days, no credit card | 7 days |
| Entry price | USD 9/month, Starter, 10k pageviews | USD 15/month, 100k pageviews |
| Sites included | 1 Starter, 3 Growth, 10 Business | At least 50 on every plan |
| Data retention | 3 years Starter and Growth, 5 years Business | "Forever" while you are a customer |
| Cookies | None. No cookies, cache or local storage | None. Cookie-free tracking |
| Visitor ID | `hash(daily_salt + website_domain + ip_address + user_agent)` | Cookieless, IPs anonymised |
| Data location | EU, infrastructure owned by European companies | EU servers for EU visitors, US for the rest |
| Funnels and journeys | Yes, Business plan | No |
| Session replay, heatmaps | No, stated design position | Not listed as a feature |
| Ecommerce revenue | Business plan | Every plan |
| API | Stats API on Business, 600 req/hour, more on request | Every plan, 600 req/hour and 5 concurrent included, paid tiers above |
| Open source | Community Edition, AGPLv3 | No, hosted product is closed source |
| Self-hosting | Yes, Community Edition | Only Fathom Lite, the legacy v1 |

## Pricing: the numbers are not comparable as published

Plausible's slider starts at 10,000 monthly pageviews. At that volume, billed monthly, Starter is USD 9, Growth USD 14 and Business USD 19. Higher volumes are calculated in the browser, so we have not quoted them.

Fathom starts at 100,000 pageviews for USD 15 per month, with 500,000 at USD 45. Its slider is labelled at 100k, 500k, 2M, 10M and 25M+, with intermediate steps in between. Both offer two months free on yearly billing.

That gap in starting point is the trap: Fathom's cheapest plan covers ten times the volume of Plausible's, so "9 versus 15" tells you almost nothing. Two other distortions. Fathom's slider asks "About how many pageviews and events do you get per month?", so custom events consume the same quota as pageviews. And Plausible gates features by plan, so it can push you to Business for the Stats API, custom properties, ecommerce revenue or funnels regardless of traffic, whereas the only thing Fathom sells separately is API capacity. Price both at your real volume, on the tier that carries what you need.

## Where Plausible wins

**Open source and a real self-hosting path.** Community Edition is AGPLv3 and free to run yourself. It is not the full product: marketing funnels, user journeys, ecommerce revenue goals, SSO and the Sites API are excluded, and it is "a long term release published twice per year". Fathom's current product is SaaS only, and the MIT-licensed Fathom Lite is maintained legacy software rather than an open-source Fathom, as the FAQ below sets out.

**Funnels and user journeys**, on the Business plan. Fathom's features page lists neither, and Fathom states that "If a feature isn't listed here or documented in our help centre, it's not part of our software."

**Everything stays in the EU.** Plausible processes and stores visitor data in the EU on infrastructure owned by European companies, for every visitor, not just European ones.

**A longer trial.** 30 days with no card, against 7 days. Analytics needs traffic to accumulate before a dashboard says anything useful.

**Documented first-party proxying**, routing the script through your own domain via edge functions or a reverse proxy, free and self-managed, with a managed version on Enterprise. That matters if ad blockers eat a chunk of your traffic, which we cover in [first-party proxying for analytics](/blog/ad-blockers-analytics-first-party-proxy).

## Where Fathom wins

**Many sites, cheaply.** Every plan includes at least 50 sites, the 1M plan includes 75, and extra capacity comes in packs of 50 for USD 10 per month. Plausible gives you 1, 3 or 10. For an agency or a portfolio of small properties, this is not close.

**Almost no feature gating.** Every Fathom plan has every feature: event conversions, ecommerce, UTM tracking, email reports, exports, dashboard sharing, GA import, bot filtering, IP and country blocking. The one exception is API capacity. Every plan includes 600 requests per hour and 5 concurrent requests, and since 19 June 2026 higher limits are sold separately, from USD 19 per month for 1,000 requests per hour up to USD 399 for 16,000.

**Data that does not expire.** Fathom advertises "forever data retention" and states that "While you're a customer, your full analytics history stays available." Plausible caps at 3 or 5 years by plan.

**EU isolation with zero configuration.** It "exists for all customers on all plans and happens without any programming or setup required", and for EU visitors the IP "is stripped from the request inside of the EU and never reaches our US infrastructure".

## Data residency and privacy design

Neither tool sets cookies or writes anything to the visitor's device. Plausible's identifier is a documented hash of a daily salt, the website domain, the IP address and the user agent, with the salt regenerated and discarded every 24 hours and the raw IP and user agent never stored. Fathom describes cookie-free tracking with IPs anonymised on arrival. Both vendors say no cookie banner is required, and both are stating a legal interpretation rather than a ruling. You remain the data controller either way. We walk through the reasoning in our guide to [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

The real divergence is jurisdiction: Plausible keeps every visitor's data on EU infrastructure, while Canadian-run Fathom splits EU and non-EU traffic across European and US servers. If procurement asks where the data sits for every visitor, the answers differ. For regulated sectors, note that Plausible states it is not HIPAA-compliant and offers no Business Associate Agreement.

## The verdict

| If this describes you | Pick |
| --- | --- |
| One site, low traffic, cheapest bill | Plausible Starter |
| An agency or portfolio with many sites | Fathom |
| You need funnels or user journeys | Plausible Business |
| You want an open-source exit and self-hosting | Plausible Community Edition |
| You want every feature on the cheapest plan | Fathom, API capacity aside |
| You want analytics history kept indefinitely | Fathom |
| All visitor data must stay inside the EU | Plausible |
| You want the longest trial before committing | Plausible |

Both have been at this since 2018 and both do what they say. The decision is usually settled by site count and by whether you need funnels.

## What neither one does

Both are web analytics, and both are candid about the boundary. Plausible's own page says it "does not cover what logged-in users do inside your product over time", it "stores no user profiles" and keeps "no cross-session history for individual visitors", and it names cohort analysis and retention curves as the point to move to a product analytics tool. Fathom lists no funnels, retention, cohorts, profiles or replay among its features.

So neither answers: which cohort of March signups was still active in week eight, where a five-step onboarding flow leaks users, or what an account did before it cancelled. Plausible's Business funnels come closest, but they run over anonymous sessions rather than identified users. That is the line between web analytics and product analytics, and both tools sit firmly on the web analytics side of it.

That is the job [Privytics](/) is built for: cookieless product analytics with funnels, retention and cohorts, user profiles once you call `identify()` with your own IDs, and opt-in session replay on paid plans, with event data stored in EU data centres in Germany and a free tier of 10,000 events per month with no credit card. If you want the head-to-head rather than the summary, we have written [Privytics vs Plausible](/blog/privytics-vs-plausible) and [Privytics vs Fathom](/blog/privytics-vs-fathom). Privytics is a newer service than either Plausible or Fathom, and if all you need is traffic reporting, both will serve you better than we will.

## FAQ

### Is Plausible or Fathom cheaper?

It depends on volume and site count. As of July 2026, Plausible starts at USD 9 per month for 10,000 pageviews on one site; Fathom starts at USD 15 for 100,000 pageviews with at least 50 sites. Fathom is usually cheaper across several sites, Plausible for one small site.

### Does Plausible or Fathom have a free plan?

Neither has a free hosted plan. Plausible offers a 30-day trial with no credit card and states plainly that it is a paid hosted service. Fathom offers a 7-day trial and says on its pricing page: "Nope, and here's why: we've heavily invested in enterprise-level infrastructure with great speed and reliability." Plausible Community Edition is free to self-host.

### Can you self-host Plausible and Fathom?

Plausible, yes: Community Edition is AGPLv3 and free, though it excludes marketing funnels, user journeys, ecommerce revenue goals, SSO and the Sites API. Fathom's current product cannot be self-hosted. Fathom Lite, the older v1 codebase, is MIT-licensed on GitHub, but it gets bug fixes rather than features and it uses cookies.

### Do Plausible or Fathom require a cookie banner?

Both vendors state that none is required, because neither sets cookies or writes to the visitor's device. That is a vendor legal interpretation rather than a ruling, and your obligations depend on your jurisdiction and the rest of your stack. Other scripts on your site may still trigger a banner.

### Does Plausible or Fathom have funnels?

Plausible has funnels and user journeys on its Business plan. Fathom lists neither. Neither tool offers retention curves, cohorts or user profiles.

### Where do Plausible and Fathom store data?

Plausible processes and stores all visitor data in the EU on infrastructure owned by European companies. Fathom is a Canadian corporation with EU isolation on by default: European visitors' pageviews go to European servers and the IP is stripped inside the EU, while non-EU visitors are sent to US servers with the IP anonymised there.

### Does either tool offer session replay?

No. Plausible states it does not record individual visitor sessions and has no mouse movement recordings, rage click detection or heatmaps, presenting that as a deliberate design position. Fathom does not list replay or heatmaps as features. Session replay needs a different category of tool.
