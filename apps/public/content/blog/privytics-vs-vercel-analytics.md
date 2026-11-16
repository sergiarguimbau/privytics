---
slug: privytics-vs-vercel-analytics
title: "Vercel Web Analytics Alternative: The Real Cost"
description: "A Vercel Web Analytics alternative compared honestly: plan caps, the per-event price above them, funnels, retention and replay. Figures checked July 2026."
date: 2026-07-29
updated: 2026-07-29
tag: Comparison
---

Privytics is a cookieless, EU-hosted alternative to Vercel Web Analytics, with a permanent free tier of 10,000 events a month and stepped paid plans from EUR 10. The usual reason people go looking is the shape of the Vercel bill: the Hobby plan includes 50,000 events a month but is restricted to non-commercial, personal use, and the Pro plan includes no analytics events at all and bills them at $3 per 100,000 against the $20 of monthly usage credit that comes with the $20 Pro platform fee (Vercel figures as of July 2026). Privytics also does the things Vercel Web Analytics does not: funnels, retention curves, cohorts, per-user profiles and session replay.

Said plainly first: Vercel Web Analytics is good at what it is for. One npm package, one component, genuinely cookieless, and it sits in a dashboard you already have open. If your questions stop at visitors, page views and referrers, this article is probably not for you.

Privytics is a newer service than Vercel. Nothing below is a claim about Vercel's speed, accuracy or reliability. Everything here is a comparison of published facts, checked against Vercel's own documentation and pricing pages on 2026-07-29.

## What Vercel Web Analytics includes, by plan

| Plan feature | Hobby | Pro | Pro with Web Analytics Plus | Enterprise |
| --- | --- | --- | --- | --- |
| Included events | 50,000 / month | None | None | None |
| Additional events | Cannot be purchased | $3 per 100K ($0.03 per 1K) | $3 per 100K | Custom |
| Add-on price | n/a | n/a | $10 / month per team | n/a |
| Reporting window | 1 month | 12 months | 24 months | 24 months |
| Custom events | Not available | Included | Included | Included |
| Properties per custom event | n/a | 2 | 8 | 8 |
| UTM parameters | Not available | Not available | Included | Included |
| Projects | Unlimited | Unlimited | Unlimited | Unlimited |

Four details there do most of the damage, and none are obvious from the marketing page.

**Hobby is not a free plan for a business.** Vercel's documentation restricts Hobby to non-commercial, personal use only under its fair use guidelines. The 50,000 free events are real, but not available to a company site, a SaaS product or a client project.

**Pro includes zero analytics events.** The $20 platform fee comes with $20 of monthly usage credit, but that credit is shared across managed infrastructure: functions, data transfer beyond the included allocation, image optimisation. Whether analytics is "free" on Pro depends on what else you consumed that month. It is a shared budget, not an analytics allowance.

**Usage pools across the whole team.** Events are shared across all projects under the same account, so ten small sites draw from one meter.

**Custom events are shallow by design.** Two properties per event on Pro, eight with the Plus add-on. No nested objects, values limited to strings, numbers, booleans and null, and a 255 character ceiling on names, keys and values. Fine for `track('Signup', { location: 'footer' })`, awkward for a real tracking plan.

And for Hobby users: past 50,000 events a three day grace period starts, then collection stops, with a documented seven day wait before events flow again. Your analytics has holes in it.

## Where the data lives

Vercel Inc. is a US company based in California. Its privacy policy has you consent to processing in the United States and other jurisdictions in which it operates, relying on standard contractual clauses and certification to the EU-U.S. Data Privacy Framework for international transfers.

Vercel publishes a detailed region list, but that covers CDN points of presence and the regions where your functions run. We could not find documentation of an EU-only storage option for Web Analytics event data specifically. If EU residency is a requirement rather than a preference, ask Vercel directly rather than inferring it from your function region.

Privytics stores analytics event data in EU data centres in Germany, is operated from Spain, and bills through Polar as merchant of record.

To be fair on privacy: Vercel Web Analytics is properly cookieless. Visitors are identified by a hash created from the incoming request, valid for a single day and then reset, and Vercel states visitors cannot be tracked between different days or different websites. That is the same shape as the Privytics model: a daily rotating salted hash of IP address, user agent and project id, with the salt rotating at midnight UTC. Vercel documents Web Analytics as not using cookies; Privytics stores nothing on the device at all. If cookie banners are why you are here, both tools solve that, and the rest of this page is about scope and cost.

## What Vercel Web Analytics cannot do

The documented feature set is visitors, page views, bounce rate, and panels breaking those down by page, referrer, country, OS, browser, device, custom event and feature flag. CSV export is capped at 250 entries per panel, and bots are filtered by user agent.

Absent from the documentation: funnels, retention curves, cohorts, user identification, per-user profiles and session replay. Vercel's own marketplace points you at third party analytics tools, PostHog among them, for that class of work. This is not a criticism, it is a scope decision, and it is the same boundary we describe in [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics).

Credit where it is due on portability: Web Analytics Drains forward page views and custom events to your own HTTPS endpoint as JSON or NDJSON, with a configurable sampling rate. Note the gate: Drains are Pro and Enterprise only, not available on Hobby, and billed separately by volume. On a paid plan your raw events are not locked in; on Hobby they are.

## The cost cliff

Vercel's per-event rate is flat, so cost scales linearly with traffic. Privytics uses stepped tiers, so cost jumps and then flattens.

| Monthly events | Vercel Web Analytics usage cost | Privytics plan cost |
| --- | --- | --- |
| 10,000 | $0.30 | Free |
| 100,000 | $3 | EUR 10 |
| 500,000 | $15 | EUR 20 |
| 1,000,000 | $30 | EUR 40 |
| 5,000,000 | $150 | EUR 100 |
| 10,000,000 | $300 | EUR 200 |

Read that carefully rather than triumphantly. The Vercel column excludes the $20 platform fee, ignores the $20 shared credit that may absorb some or all of it, and excludes the $10 Plus add-on you will want for UTM parameters or more than two event properties. The Privytics column excludes VAT. Different currencies, not a conversion.

The honest reading: **below roughly a million events a month, Vercel is cheaper**, often free in practice because the shared credit swallows it. Past that the flat rate keeps climbing while stepped tiers do not, so 10M events is $300 against EUR 200.

The other cliff is not financial. It is the day someone asks "how many people who signed up last month came back in week four?" and your analytics tool cannot express the question.

## Privytics vs Vercel Web Analytics side by side

| Attribute | Privytics | Vercel Web Analytics |
| --- | --- | --- |
| Category | Product analytics | Web analytics |
| Free tier | 10,000 events/month, 1 project, permanent, no card | 50,000 events/month on Hobby, non-commercial use only |
| Projects | 1 on the free tier | Unlimited on all plans, including Hobby |
| Entry paid price | EUR 10/month for 100k events (excl. VAT) | $3 per 100K events, plus $20 Pro platform fee |
| Pricing model | Stepped tiers | Per event, metered |
| Data location | EU data centres in Germany | US company; no documented EU-only analytics residency |
| Operating entity | Independent European service, operated from Spain | Vercel Inc., United States |
| Cookies | None. Nothing stored on the device | None documented; Vercel states Web Analytics does not use cookies |
| Visitor ID method | Daily rotating salted hash of IP + user agent + project id | Hash created from the incoming request, reset daily |
| Custom event properties | Arbitrary properties per event | 2 on Pro, 8 with the $10 Plus add-on |
| Funnels | Yes, all plans | No |
| Retention curves | Yes | No |
| Cohorts | Yes | No |
| User identification | Yes, via `identify()` with your own IDs | No |
| Session replay | Yes, opt-in per project, paid plans only | No |
| Data retention / reporting window | 12 months free, 5 years paid | 1 month Hobby, 12 months Pro, 24 months with Plus (Vercel's guaranteed reporting window) |
| UTM parameters | Yes | Plus add-on and Enterprise only |
| Raw event export | REST API and export | Drains to your own HTTPS endpoint, Pro and Enterprise only, billed by volume |
| Open-source engine | Yes, the underlying OpenPanel engine is AGPL-3.0 and self-hostable | No |
| Portability | Works on any host | Requires deploying on Vercel |

That last row matters more than it looks. Vercel Web Analytics only measures what you deploy to Vercel, so if part of your stack lives elsewhere, or you may move hosts later, your historical analytics is tied to a hosting decision.

## Stay on Vercel Web Analytics if

- **You have a personal project on Hobby and 50,000 events is plenty.** Free, one line of setup, and nothing here beats that.
- **Your questions stop at traffic.** Top pages, referrers, countries, browsers. That is what it is built for and it does it cleanly.
- **You want zero extra vendors.** One bill, one dashboard, one support channel is worth real money to a small team.
- **US data processing is not an issue for you.** If your users are not in the EU, or your compliance posture already accommodates US processors, the residency question is moot.

## Switch if

- **Your event bill is now a line item you notice.** Past roughly a million events a month, flat per-event pricing stops being a rounding error.
- **You need product questions answered.** Funnels, retention, cohorts and user-level analysis are outside this product's scope, and Vercel's own marketplace lists third party analytics tools, PostHog among them, for that work. Our write-up of that toolset is [how funnels, retention and cohorts work without cookies](/blog/funnels-retention-cohorts-without-cookies).
- **Two properties per event is not enough.** A real tracking plan usually needs more, and $10 a month to reach eight is still a low ceiling.
- **You run a commercial site on Hobby.** That is outside Vercel's fair use terms, and a free tier with no commercial restriction is a cleaner answer.
- **You need EU data residency in writing.**
- **You are not exclusively on Vercel.** Installation is the same script or SDK anywhere: see the [Next.js](/for/nextjs), [React](/for/react) and [Remix](/for/remix) guides.

Privytics is built on the open-source OpenPanel engine (AGPL-3.0), and is an independent service, not affiliated with, endorsed by, or sponsored by OpenPanel.

## FAQ

### Is Vercel Web Analytics free?

On Hobby, yes, up to 50,000 events per month, but Vercel restricts Hobby to non-commercial, personal use only. Pro includes no analytics events: usage is billed at $3 per 100,000 events against the plan's $20 monthly credit, which is shared with other infrastructure usage (checked 2026-07-29).

### How much does Vercel Web Analytics cost at 1 million events?

At the published rate of $3 per 100,000 events, one million events is $30 a month, before the $20 Pro platform fee, any shared credit, and the optional $10 Plus add-on. Verify current pricing before budgeting.

### Does Vercel Web Analytics have funnels or session replay?

No. The documented feature set covers visitors, page views, bounce rate and breakdown panels. Funnels, retention curves, cohorts, user profiles and session replay are not part of it, and Vercel's marketplace lists third party tools for that work.

### Does Vercel Web Analytics use cookies?

No. Visitors are identified by a hash created from the incoming request, which resets daily, and Vercel states visitors cannot be tracked across days or websites. Privytics uses the same approach with a daily rotating salted hash, and stores nothing on the device at all.

### Where does Vercel store Web Analytics data?

Vercel Inc. is a US company whose privacy policy describes processing in the United States and other jurisdictions, relying on standard contractual clauses and EU-U.S. Data Privacy Framework certification. We found no documented EU-only residency option for Web Analytics data. Privytics stores analytics event data in EU data centres in Germany.

### Does Privytics work if I stay on Vercel?

Yes. Privytics installs as a script or SDK and is host-agnostic, so it runs on a Vercel deployment exactly as it does anywhere else. Some teams keep Vercel Web Analytics for traffic numbers and add Privytics for the product questions.

## Trying Privytics

The free tier is 10,000 events a month with 12-month retention, one project and no credit card. Paid plans start at EUR 10 a month for 100,000 events and add five year retention plus session replay, opt-in per project and masking all text and inputs by default.

If you are a solo developer on Hobby with a personal site, stay where you are. Vercel Web Analytics is free, adequate and already installed.
