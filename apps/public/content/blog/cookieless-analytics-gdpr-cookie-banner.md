---
slug: cookieless-analytics-gdpr-cookie-banner
title: "Cookieless Analytics and GDPR: Do You Still Need a Cookie Banner?"
description: Often not. When cookieless analytics lets you drop the cookie banner, when it does not, and what GDPR still asks of you.
date: 2026-07-19
updated: 2026-11-27
tag: Compliance
---

Often not. If no tool on your site stores anything on visitors' devices, you can usually drop the banner, depending on where your visitors are. GDPR still applies, and we list what it asks below.

This is not legal advice: it shows which rule covers what, so you can brief your adviser.

## Three questions decide it

![Decision tree with three questions: does your analytics use cookies, do other tags use cookies, do local rules require consent. Any yes means a banner is needed. Three noes mean often no banner is needed, and GDPR still applies.](/images/blog/cookie-banner-decision-tree.svg)

**1. Does your analytics use cookies or other device storage?** The banner rule comes from the EU's ePrivacy law, not from GDPR. It covers storing or reading data on a visitor's device, such as cookies or local storage. So cookie-based analytics generally needs consent first.

[Cookieless analytics](/blog/what-is-cookieless-analytics) stores nothing on the device, which removes the usual trigger.

**2. Do other tags on your site use cookies?** Ad pixels, chat widgets, embedded videos and A/B testing tools often store data on the device. Any one of them brings the banner back, whatever your analytics does.

**3. Do the rules where your visitors are require consent anyway?** Each country has its own version of the ePrivacy rule, and the planned EU-wide regulation was withdrawn. So the answer can differ by country:

- **EU guidance:** the European Data Protection Board (EDPB) reads the rule broadly. Under its [guidelines on what the rule covers](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en), a script that makes the browser send data, or IP-based tracking, can be covered. The guidelines are not binding, and being covered does not always mean consent.
- **France:** the [CNIL exemption](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies-solutions-pour-les-outils-de-mesure-daudience) allows some audience measurement without consent, under conditions. Providers check themselves against them; the CNIL does not certify tools.
- **UK:** sites can now collect usage statistics without consent, if they tell visitors and offer a simple opt-out.
- **Germany:** storing or reading data on the device falls under its own law, the [TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html). Matomo's guide to the TDDDG recommends consent even without cookies.

## What GDPR still asks of you

GDPR is a separate law. It covers what you do with personal data, whether or not anything is stored on the device.

| What you need        | With cookieless analytics |
|----------------------|---------------------------|
| Cookie banner        | Often not ¹               |
| Lawful basis         | Yes ²                     |
| Privacy notice       | Yes                       |
| DPA with your vendor | Yes                       |

¹ When all three answers above are no. ² [Legitimate interests](https://www.edpb.europa.eu/documents/guideline/guidelines-12024-on-processing-of-personal-data-based-on-article-61f-gdpr_en) is a common choice for anonymous analytics.

## How Privytics handles it

Privytics sets no cookies and stores nothing on your visitors' devices, so anonymous analytics generally needs no cookie banner. Each visitor gets an anonymous ID that changes every day.

For developers: the ID is a hash of IP address, user agent and project ID, with a secret salt that rotates at midnight UTC. We keep the previous day's salt for one extra day, so a visit that runs past midnight is not split in two. Then we delete it.

- **Data location:** analytics data is stored in EU data centres in Germany.
- **Contract:** a GDPR [data processing agreement](/dpa) is included on every plan, free included.
- **Signed-in users:** calling `identify()` links events to your own user IDs. That is personal data, so you choose the lawful basis (often consent).
- **Consent gating:** start with `disabled: true` and call `op.ready()` once the visitor agrees. It works with the [script tag](/for/script-tag) and the SDKs.

Retention and cohorts work for signed-in users you identify. [Funnels, retention and cohorts without cookies](/blog/funnels-retention-cohorts-without-cookies) shows what you get with and without `identify()`.

## When a banner is the better choice

- You need to recognise anonymous visitors across days. A daily ID cannot do that.
- You run ad audiences or remarketing. Those tags need consent anyway, and Privytics has no Google Ads integration.
- Your policy is to ask consent for all analytics. Privytics can run behind your banner too.

## When Privytics fits

- Visitors who decline your banner cost you a large share of your data.
- Analytics is the only tag that would need consent, so dropping the banner is realistic.
- You want traffic, custom events and in-session funnels without a consent step.

## FAQ

### Is an IP address personal data?

It can be: the [EU Court of Justice](https://curia.europa.eu/juris/liste.jsf?num=C-582/14) has held that a dynamic IP address can be personal data. Privytics uses the IP to work out country, region and city, and does not store the raw IP.

### Does using Privytics make my site GDPR compliant?

No tool can do that alone: you remain the data controller and choose the lawful basis. We use your data only to run your analytics, never for advertising.

### What if my site also runs Google Analytics?

Then keep the banner: in the EU, Google Analytics needs cookie consent before it runs, and [Consent Mode v2](/blog/google-consent-mode-v2-alternative) is a signal, not consent. [Is Google Analytics legal in the EU?](/blog/is-google-analytics-legal-eu-2026) covers the rest.
