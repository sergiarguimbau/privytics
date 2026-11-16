---
slug: privytics-vs-plausible
title: "Privytics vs Plausible Analytics: EU Privacy Analytics Compared"
description: Privytics vs Plausible Analytics compared on price, EU hosting, cookieless tracking, funnels, cohorts and session replay. Honest facts, checked July 2026.
date: 2026-07-19
updated: 2026-07-29
tag: Comparison
---

Privytics and Plausible Analytics are the closest philosophical peers in this category. Both are cookieless by default, both store visitor data in the EU, and both are built on open source under the AGPL. The real difference is scope and entry cost: Plausible is deliberately a web analytics tool that stops at anonymous, session-level insight, while Privytics is a product analytics tool with funnels, retention, cohorts, user profiles and opt-in session replay. Privytics also has a permanent free tier of 10,000 events per month; Plausible has a 30-day trial and then you pay. If you only need traffic, sources, content and conversion goals, Plausible is a mature, proven choice and probably the safer one.

Worth saying plainly up front: Privytics is a newer service than Plausible, which has been running its hosted service for years. Nothing below is a claim about speed, accuracy or reliability. Everything here is a comparison of published facts: price, hosting location, storage behaviour, retention and features.

## Privytics vs Plausible side by side

| Attribute | Privytics | Plausible Analytics |
| --- | --- | --- |
| Category | Product analytics | Web analytics (explicitly not product analytics) |
| Free tier | 10,000 events/month, no card | None on cloud. 30-day trial, no card required |
| Entry paid price | EUR 10/month for 100k events (excl. VAT) | From USD 9/month Starter at 10k monthly pageviews |
| Data location | Germany, EU only | Falkenstein, Germany, EU only |
| Operating entity | Independent European service, operated from Spain | Plausible Insights OÜ, incorporated in Estonia |
| Cookies | None. No device storage for anonymous analytics | None. No persistent identifiers |
| Visitor ID method | Daily rotating salted hash of IP + user agent + project id | hash(daily_salt + website_domain + ip_address + user_agent) |
| Funnels | Yes, all plans | Business plan only |
| Retention curves | Yes | No |
| Cohorts | Yes | No |
| User identification | Yes, via `identify()` with your own IDs | No user IDs, no user-level analysis |
| Session replay | Yes, opt-in per project, paid plans only | No, stated as a deliberate design choice |
| Data retention | 12 months free, 5 years paid | 3 years Starter and Growth, 5 years Business |
| Self-hostable | Yes, the engine is AGPL-3.0 | Yes, Community Edition, AGPLv3 |
| Billing units | Events | Pageviews plus custom events |
| Project/site limit | 1 on free tier | 1 site Starter, 3 Growth, 10 Business |

Plausible prices, plan limits and retention terms are as of July 2026, checked on 2026-07-29 against the [Plausible pricing page](https://plausible.io/#pricing) and its public documentation. Confirm the current terms before you decide. The prices are the USD default; the page localises currency client side, so a visitor elsewhere may see a different currency. Prices above the 10,000 pageview tier are calculated in the browser, so we have not quoted them here. Plausible also advertises "2 months free" on yearly billing, and a [15% discount for nonprofits, educational institutions and open-source projects](https://plausible.io/docs/nonprofit-and-education-pricing) that applies to the first payment on a yearly Business plan.

## Where they genuinely differ

### Depth of analysis

This is the whole comparison in one line. Plausible answers "how much traffic, from where, and did it convert?" Privytics answers that too, but also "which users came back in week four, and where did the ones who churned drop off?"

Plausible is unusually clear about this boundary. Its own documentation states that if you need cohort analysis, feature flag measurement, retention curves, experimentation, user-level behaviour analysis inside your app, or session replay tied to specific user accounts, you need a product analytics tool, and it names Mixpanel, Amplitude and PostHog. Plausible does ship funnels and user journeys on the Business plan, but those are marketing funnels over anonymous sessions, not product funnels over identified users. If that split is new to you, we wrote it up in [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics).

Privytics inherits the OpenPanel engine's product analytics model: custom events, user profiles once you call `identify()`, funnels, retention, cohorts and dashboards, plus a REST API. If your questions are about logged-in behaviour, that difference matters more than anything else on this page, and our [guide for SaaS products](/for/saas) is the practical starting point.

### Session replay

Privytics has rrweb-based session replay, off by default, opt-in per project, masking all text and inputs unless you configure otherwise. It is a paid feature and is switched off on the free tier.

Plausible does not have it. Its ["when not to use Plausible" page](https://plausible.io/when-not-to-use-plausible) states that it does not record individual visitor sessions and that there are no mouse movement recordings, rage click detection or heatmaps, and it directs readers who need visual replay to dedicated tools instead (checked 2026-07-29). It presents that as a scope decision rather than a gap.

That is a legitimate stance, and if you share it, the absence is a feature. If replay is a requirement, Plausible's own documentation points you elsewhere.

### Cost at the bottom of the range

Privytics has a permanent free tier: 10,000 events per month, one project, 12 months retention, community support, no SLA, no credit card. Plausible has no permanent free hosted tier, which it acknowledges on its own "when not to use Plausible" page. You get a 30-day trial with full Business features and no card, then a subscription.

Be careful comparing the numbers directly. Plausible bills pageviews plus custom events, so outbound link clicks, downloads, form submissions and 404 tracking all count towards your tier. Privytics bills events. A content site with light event tracking and a product with heavy event tracking will land in very different places, so map your own volume rather than assuming the units are equivalent.

The free path Plausible does offer is Community Edition, which is genuinely free and AGPLv3, but the gap to cloud is real and documented in [Plausible's own self-hosting docs](https://plausible.io/docs/self-hosting) (checked 2026-07-29): CE excludes marketing funnels, user journeys, ecommerce revenue goals, SSO and the Sites API, ships releases twice a year rather than continuously, and has only basic user agent based bot filtering where cloud additionally excludes a large list of data centre IP ranges. By Plausible's own account, that means self-hosted counts include more bot traffic and features arrive later than on cloud.

### Privacy design

Neither tool wins here. Both are cookieless by design and both derive a daily identifier that cannot follow someone across days.

Plausible's documented formula, on its [data policy page](https://plausible.io/data-policy) as at 2026-07-29, is hash(daily_salt + website_domain + ip_address + user_agent), with the salt rotated and deleted every 24 hours and raw IP and user agent never stored. The domain term prevents linkage across sites.

Privytics derives its anonymous visitor id from a daily rotating salted hash of IP address, user agent and project id, with the salt rotating at midnight UTC. The approach is the same shape as Plausible's, with the project id playing the role their site domain does. If the mechanics are new to you, [what cookieless analytics actually means](/blog/what-is-cookieless-analytics) sets out what a daily rotating identifier can and cannot tell you, including where it stops counting returning visitors.

The divergence is that Privytics supports identified analytics when you choose to call `identify()` with your own user ids and traits. That is a deliberate capability, not an accident, and it is what makes cohorts and retention possible. If you never call it, the data stays anonymous.

Neither vendor can make you GDPR compliant. Both offer a DPA ([Plausible's is here](https://plausible.io/dpa), [ours is here](/dpa)), both keep data in the EU, and in both cases you remain the data controller and are responsible for your own compliance assessment. Plausible's position that no cookie banner is required is the most confident in the market, but it is a legal interpretation, and your DPO or counsel should confirm it applies to you. Nothing on this page is legal advice. Our longer write-up of the reasoning is in [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner). If you do want consent gating, Privytics supports it: initialise with `disabled: true` and call `ready()` once the visitor has consented.

### Open source terms

Both engines are AGPL. One nuance worth getting right: Plausible's premium code is published but is not AGPL. It sits in an `extra/` directory whose own copying notice states that the code is provided for informational purposes only and grants no rights to use, distribute or otherwise exploit it, while the rest of the repository is AGPLv3. The tracker script is separately MIT licensed, so embedding it does not create copyleft obligations for your site. Privytics is built on OpenPanel, which is AGPL-3.0, and our source is public at [github.com/sergiarguimbau/privytics](https://github.com/sergiarguimbau/privytics). Privytics is an independent service and is not affiliated with, endorsed by, or sponsored by OpenPanel.

## When Plausible is the better choice

Pick Plausible if any of these describe you. If your shortlist is Plausible against another pure web analytics tool rather than against a product analytics one, we cover that pairing in [Plausible vs Fathom](/blog/plausible-vs-fathom).

- **You run a content site or marketing site and only need aggregate traffic data.** Plausible's single-page dashboard is readable by non-analysts in about a minute. Privytics gives you more surface area than you need.
- **You want a proven operator.** Plausible has years of hosted service behind it. Privytics is the newer service, so if length of operating record is part of your vendor selection, Plausible has more of it.
- **Removing the cookie banner is the primary goal.** Both tools are cookieless, but Plausible's public legal posture on consent is the most developed in the category and there is value in a vendor that has argued it in public for years.
- **You object to session replay on principle.** Plausible does not offer it and states it does not record individual visitor sessions. Privytics has it, even if it is off by default and masked.
- **You want to self-host with the least effort.** Community Edition is a documented, Docker-based, well-trodden path with a large community.
- **You want an established company as the counterparty.** Plausible's parent entity is Estonian and has been trading for years. Privytics is an independent European service operated from Spain, so both keep ownership inside the EU, but Plausible is the longer-standing of the two.

One more for accuracy: Plausible's primary servers are in Falkenstein, Germany, but its infrastructure also involves other EU suppliers. Its own pages describe a database and data-export host in Finland, and a CDN, DNS and DDoS protection provider in Slovenia (checked 2026-07-29). If you are doing supplier diligence, ask for the current list rather than assuming a single vendor.

## When Privytics fits better

If you need retention curves, cohorts, user-level funnels or session replay, Plausible's own documentation points you to a product analytics tool instead. If you want to start at zero cost with a permanent free tier rather than a trial clock, that is the other clear case. Weigh both against Plausible's longer operating history.

## FAQ

### Is Plausible free?

Not on the hosted service. There is a 30-day free trial with no credit card required, after which it is a subscription starting from USD 9 per month for up to 10,000 monthly pageviews, as of July 2026 (checked 2026-07-29). Community Edition is free to self-host but excludes funnels, user journeys, revenue goals, SSO and the Sites API.

### Does Plausible have session replay?

No. Plausible states it does not record individual visitor sessions and has no mouse movement recordings, rage click detection or heatmaps. It is a stated design position, not a missing feature.

### Can Plausible do cohort and retention analysis?

No. Plausible's own documentation names cohort analysis, retention curves, feature flag measurement and experimentation as the point at which you should move to a product analytics tool.

### Do Privytics and Plausible both keep data in the EU?

Yes. Plausible stores visitor data in the EU, on servers in Falkenstein, Germany, with an Estonian parent company. Privytics stores analytics event data in EU data centres in Germany, and is operated from Spain.

### Do I need a cookie banner with either tool?

Both are cookieless and set no identifiers on the visitor's device, which is the basis for Plausible's position that no consent is required. Consent law varies by jurisdiction and you remain the data controller, so confirm with your own compliance advice rather than relying on a vendor page.

### Which one counts usage more cheaply?

It depends on your event mix. Plausible bills pageviews plus custom events, so link clicks, downloads and form submissions all count. Privytics bills events. Estimate against your own traffic before assuming either is cheaper.

## Trying Privytics

If the product analytics side is what you are missing, the free tier is 10,000 events a month, permanently, with no credit card. One project, 12 months of retention, community support. Export your data any time, and since the engine is AGPL, self-hosting is always available as an exit. If Plausible already answers your questions, keep using it.
