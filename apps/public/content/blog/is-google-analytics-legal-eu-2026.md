---
slug: is-google-analytics-legal-eu-2026
title: "Is Google Analytics legal in the EU in 2026?"
description: "Yes, with two conditions: cookie consent first, and US transfers covered by the Data Privacy Framework. Where that framework stands now."
date: 2026-07-22
updated: 2026-11-27
tag: Compliance
---

Yes, it can be used lawfully, with two conditions: cookie consent before it runs, and US transfers covered by the EU-US Data Privacy Framework (DPF). The DPF is valid today, but it is under legal challenge.

We build Privytics, a cookieless analytics tool, so we have a stake in this question. What follows is general information, not legal advice.

## Two separate questions

Most of the confusion comes from mixing two rules. Each has its own law and its own condition.

| Question              | Law      | GA passes if           |
|-----------------------|----------|------------------------|
| Cookies on the device | ePrivacy | Visitor consents first |
| Data sent to the US   | GDPR     | The DPF stays valid    |

The DPF only answers the second question. You can pass one and fail the other.

The cookie rule is about storing or reading data on the visitor's device. Standard GA sets cookies, so in the EU it generally needs consent before it runs, whatever happens to the DPF. Our [cookie banner guide](/blog/cookieless-analytics-gdpr-cookie-banner) covers that rule in detail.

## Why people say it was banned

The "banned" headlines come from the transfer question:

- **2020:** the EU's top court (CJEU) struck down Privacy Shield, the previous EU-US transfer deal.
- **2021 to 2022:** regulators in Austria, France and Italy ruled against specific uses of GA over its US transfers.
- **July 2023:** the European Commission adopted the DPF. Google is [certified under it](https://policies.google.com/privacy/frameworks).

Those rulings targeted specific sites, and all of them came before the DPF. With the DPF in force, GA's US transfers have a legal basis.

## Where the DPF stands now

The DPF is in force, but it is under pressure from several sides:

- **An appeal is pending** at the CJEU, the same court that struck down Privacy Shield.
- **A US ruling.** In June 2026 the US Supreme Court ruled that the President can remove the commissioners of the FTC, a US watchdog the DPF relies on.
- **A planned lawsuit.** The same day, the privacy group noyb said it would sue to annul the DPF and asked the Commission to withdraw it. It has not announced a filing yet.
- **A review request.** In July 2026 the EDPB, the board of EU data protection authorities, asked the Commission to review the DPF.

None of this changes the answer today. It is the risk you carry if you build on GA for the long term.

## How cookieless analytics changes the picture

GA raises both questions because it sets cookies and sends data to the US. A cookieless tool that stores its analytics data in the EU removes the main trigger for each.

|                | Google Analytics | Privytics       |
|----------------|------------------|-----------------|
| Cookies        | Yes              | None            |
| Cookie banner  | Generally needed | Generally not ¹ |
| Data stored in | Google's servers | Germany         |

¹ For anonymous analytics.

Instead of a cookie, each visitor gets an anonymous ID that changes every day; nothing is stored on the device. For developers: the ID is a hash of IP address, user agent and project ID, with a secret salt that rotates at midnight UTC.

Analytics data is stored in EU data centres in Germany. Some supporting services are US companies working under standard contractual clauses: payments, email, error monitoring, website and dashboard hosting with script delivery, and the AI features. Our [privacy policy](/privacy) lists each one.

Two things still apply:

- **Identified users.** Calling `identify()` links events to your own user IDs. That is personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first.
- **GDPR.** You still need a lawful basis, a privacy notice and a DPA with your vendor. Legitimate interests is a common basis for anonymous analytics. Our [DPA](/dpa) is included on every plan, free included.

Features and prices side by side: [Privytics vs Google Analytics](/blog/privytics-vs-google-analytics).

## When Google Analytics is the better choice

- **You run on Google Ads.** Linking GA to Google Ads turns key events into Ads conversions and gives you remarketing audiences. Privytics has no Google Ads integration.
- **You need a banner anyway.** If other tags on your site store data on the device, the banner stays whichever analytics tool you use.
- **You want it free at any volume.** GA4 is free. Privytics is free up to 10,000 events a month, and paid plans start at €10 a month (excl. VAT).

## When Privytics fits

- You want anonymous analytics that generally needs no cookie banner.
- You want your analytics data stored in EU data centres in Germany.
- You want product analytics: funnels, plus retention and cohorts for signed-in users you identify ([how that works](/blog/funnels-retention-cohorts-without-cookies)).

## FAQ

### Does Consent Mode v2 let me skip the cookie banner?

No. Consent Mode is a signal, not consent: in the EU, GA4 still needs consent before it sets cookies ([more on Consent Mode](/blog/google-consent-mode-v2-alternative)).

### Can Google Analytics store my data in the EU?

GA4 offers no choice of storage region. Google collects EU traffic on EU servers, then forwards it to its Analytics servers.

### Is an IP address personal data?

It can be. The CJEU held in 2016 that even a dynamic IP address can be personal data.

### Are the rules the same in every country?

No. France and the UK, for example, allow some audience measurement without consent, under conditions, so follow the rules where your visitors are.
