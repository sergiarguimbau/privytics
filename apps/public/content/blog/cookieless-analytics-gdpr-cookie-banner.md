---
slug: cookieless-analytics-gdpr-cookie-banner
title: "Cookieless Analytics and GDPR: Do You Still Need a Cookie Banner?"
description: Do you need a cookie banner for analytics under GDPR and ePrivacy? What article 5(3) says, why cookieless changes the answer, and what GDPR still requires.
date: 2026-07-19
updated: 2026-07-29
tag: Compliance
---

The short answer: the consent banner requirement comes from the ePrivacy Directive, and it is triggered by storing information on, or reading information from, a visitor's device. It is not triggered by "doing analytics". So an analytics tool that writes nothing to the device and reads nothing from it falls outside the rule that makes banners necessary. That is a real difference, and it is why [cookieless analytics](/blog/what-is-cookieless-analytics) exists. It is also only half the picture, because GDPR is a separate instrument with separate obligations, and those do not disappear just because you dropped the cookie.

This is not legal advice. It is a technical explanation of which rules attach to which behaviour, written so you can have a more precise conversation with whoever does advise you. You remain the data controller for your own site, and the responsibility for your compliance position is yours.

## The two questions people mix up

Almost every confused discussion of cookie banners is two separate questions wearing one coat.

**Question one is the ePrivacy question.** Article 5(3) of Directive [2002/58/EC](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32002L0058), as amended by Directive 2009/136/EC, says that storing information, or gaining access to information already stored, in the terminal equipment of a user is only allowed with that user's informed consent. There are two exemptions: where it is done for the sole purpose of carrying out the transmission of a communication, or where it is strictly necessary to provide a service the user has explicitly requested. Analytics is not generally treated as strictly necessary to deliver the page a visitor asked for, so analytics cookies usually fall outside the exemption, and marketing cookies clearly do. Some regulators operate a narrow exemption route for strictly necessary audience measurement, covered further down.

Two things about article 5(3) are usually missed. It is technology neutral, so it covers localStorage, IndexedDB, cache tricks, ETag tracking and device fingerprinting, not just cookies. And it is about the *act of storing or reading*, not about whether the data is personal, which is why even a purely technical identifier written to a device needs consent.

**Question two is the GDPR question.** Once you have data about a person, whatever way you obtained it, you need a lawful basis under article 6, you need to tell people about it, and you need to honour data subject rights. This applies even when article 5(3) does not, because you can process personal data without ever touching the device's storage. An IP address arriving in an HTTP request is the obvious example.

Cookieless analytics answers question one. It does not answer question two.

## Why "no device storage" changes the analysis

A browser sends an IP address and a user agent string as an inherent part of making an HTTP request. The server does not reach into the device to retrieve them; they arrive because that is how the protocol works. Passive receipt of what the request already contains is generally treated as outside the "storing or gaining access to" language of article 5(3).

Actively interrogating the device is different. Canvas rendering, font enumeration, WebGL parameters and the rest of the fingerprinting toolkit involve asking the device questions in order to build a persistent identifier. The Article 29 Working Party's [Opinion 9/2014 on device fingerprinting](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2014/wp224_en.pdf) made clear that article 5(3) is not limited to cookies and reaches fingerprinting. Swapping cookies for fingerprinting is not a route around consent.

So the line that matters is: does the tool write anything to the device, and does it actively query the device beyond what the request already carries? If both answers are no, the banner-triggering provision is not engaged.

## What still applies when there is no cookie

| Requirement | Source | Applies to cookieless analytics? |
| --- | --- | --- |
| Consent for storing or reading device data | ePrivacy Directive art 5(3) | No, if nothing is stored or read |
| Lawful basis for processing personal data | GDPR art 6 | Yes |
| Transparency and privacy notice | GDPR arts 12 to 14 | Yes |
| Right to object to legitimate interests processing | GDPR art 21 | Yes, where art 6(1)(f) is your basis |
| Data processing agreement with your vendor | GDPR art 28 | Yes |
| Records of processing activities | GDPR art 30 | Yes, subject to the size exemption |
| DPIA where processing is high risk | GDPR art 35 | Depends on what you collect |
| Rules on international transfers | GDPR chapter V | Yes, if data leaves the EEA |

The practical upshot is that removing cookies can remove the banner, but it does not remove the privacy policy entry, the lawful basis analysis or the vendor contract. No analytics tool delivers GDPR compliance in one script tag, ours included.

### IP addresses are personal data

This is settled. In *Breyer* ([C-582/14](https://curia.europa.eu/juris/liste.jsf?num=C-582/14), 2016) the Court of Justice held that a dynamic IP address is personal data in the hands of a website operator where legal means exist to identify the person behind it. Treat inbound IPs as personal data and design accordingly.

### Hashing is pseudonymisation, not anonymisation

A salted hash of an IP address is not magically anonymous. The Article 29 Working Party's Opinion 05/2014 on anonymisation techniques is direct about this: keyed hashing is a pseudonymisation technique, and it only tends towards anonymisation once the key is destroyed and re-identification stops being reasonably possible. Treat any claim that hashing alone puts the data outside GDPR with caution, and check what happens to the key.

## How Privytics is built, and what it does not solve

Privytics sets no cookies and uses no device storage for anonymous analytics. The anonymous visitor id is a salted hash of IP address, user agent and project id, and the salt rotates at midnight UTC. Old salts are not carried forward, so yesterday's ids cannot be reconciled with today's and the identifier cannot follow a person across days. Analytics event data is stored in EU data centres in Germany. Consent gating is built in for the cases where you do want it: initialise with `disabled: true` and call `ready()` once your banner returns a decision, whether you install through the [script tag](/for/script-tag) or one of the SDKs.

Here is what that design still leaves on your side of the line.

**Within a single day, the visitor id is a pseudonymous identifier derived from personal data.** Rotation limits the linkage window to 24 hours, but it is not anonymous data during that window. Treat it as personal data, pick a lawful basis, and say so in your notice. Legitimate interests under article 6(1)(f) is a common choice for analytics of this kind, and it means actually running the balancing test and honouring objections under article 21. It is a basis you document, not a box you assume.

**`identify()` changes the picture.** The moment you call it you are attaching your own user id and traits to the event stream, which is directly identifying data by design. It needs its own lawful basis and its own entry in your privacy notice, and the "no persistent identifier" property of the default setup no longer describes what you are doing. That is also the line between [web analytics and product analytics](/blog/product-analytics-vs-web-analytics), and it is a line you cross deliberately rather than by default.

**Session replay changes it further.** Privytics replay is rrweb based, opt-in per project, paid plans only, and masks all text and inputs by default. Even so, it captures a far richer picture of an individual session than counting page views does, and it can pick up sensitive information incidentally if masking is misconfigured. That is the kind of processing where a DPIA becomes a live question, and where [consent for session replay](/blog/gdpr-session-replay-consent) is worth working through on its own terms. Masking by default reduces risk. It does not make replay a low-risk activity. And if a replay implementation stores a session identifier on the device to stitch a recording together, article 5(3) applies to that storage regardless of what the rest of the product does.

## When you do still need a banner

Cookieless analytics is one input to your consent decision, not the whole of it. You still need a consent mechanism if any of the following is true.

- You run advertising or remarketing pixels, A/B testing tools, chat widgets, embedded video, or anything else that writes to the device. One consent-requiring tag brings the banner back for the whole site. If you are keeping Google tags and wiring up [Consent Mode v2](/blog/google-consent-mode-v2-alternative), the banner stays whatever your analytics does.
- You use `identify()` or session replay and your assessment concludes consent is the appropriate basis. Note the EDPB's [Opinion 5/2019](https://www.edpb.europa.eu/our-work-tools/our-documents/opinion-board-art-64/opinion-52019-interplay-between-eprivacy-directive_en) on the interplay between ePrivacy and GDPR: where article 5(3) consent is required for the storage step, you cannot then swap in legitimate interests for the processing that flows from it.
- Your national implementation is stricter than you expect. ePrivacy is a Directive, so it lives in 27 national laws plus the UK's PECR, and no EU-wide regulation has replaced it. The Commission withdrew its proposed ePrivacy Regulation, with the withdrawal published in the Official Journal on 6 October 2025, so the Directive and its national transpositions remain the operative law. Germany's transposition sits in [section 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html), the statute previously titled the TTDSG. France's CNIL operates a specific [exemption route for audience measurement](https://www.cnil.fr/fr/cookies-et-autres-traceurs/regles/cookies-solutions-pour-les-outils-de-mesure-daudience) with conditions attached, and since its July 2025 update it no longer publishes a list of evaluated solutions, leaving providers to self-assess against the criteria. The regulator that matters to you is the one where your users are.
- You operate outside the EU under a regime with different rules. Several US state privacy laws attach obligations to sale and sharing rather than to device storage, which is a different test entirely.

## When a different approach is the better choice

If you need cross-device identity resolution, cross-domain attribution or ad platform audience syncing, cookieless analytics is the wrong tool and no amount of design will fix that. Those use cases require persistent identifiers, which require consent. Use a tool built for it and put up a proper banner.

If you already run a mature consent management platform and your analytics sits behind it with good acceptance rates, the operational gain from going cookieless may be small. The case for cookieless is strongest when refusals are costing you a large share of your data, or when removing the banner entirely is realistic because no other tag is blocking it.

If your organisation's policy is that all analytics requires consent regardless of mechanism, that is defensible and common in regulated sectors. Follow it.

## FAQ: cookie banners and cookieless analytics

### Do I need a cookie banner if I use cookieless analytics?

If cookieless analytics is the only non-essential technology on your site and it writes nothing to the device, the ePrivacy article 5(3) consent requirement is not engaged, so the banner is generally not required. You still need a privacy notice and a lawful basis under GDPR, and any other tag that writes to the device brings the banner back.

### Is an IP address personal data under GDPR?

Yes. The Court of Justice confirmed in *Breyer* (C-582/14) that a dynamic IP address is personal data for a website operator where legal means exist to identify the individual. Hashing it is pseudonymisation, not anonymisation.

### Does using Privytics make me GDPR compliant?

No, and no analytics tool can. Privytics is designed to be cookieless, EU hosted and minimal in what it collects, and a [data processing agreement](/dpa) is available. You remain the data controller, you choose the lawful basis, and your compliance position is yours.

### Does session replay need consent?

Assume it needs its own legal basis and its own disclosure. Replay captures far more than aggregate counts, and if the implementation stores a session identifier on the device, article 5(3) applies to that storage. Privytics replay is opt-in per project, masks all text and inputs by default, and is available on paid plans only.

### Is fingerprinting a legal alternative to cookies?

No. Article 5(3) is technology neutral, and the Article 29 Working Party addressed fingerprinting directly in Opinion 9/2014. Actively probing a device to build a persistent identifier is in scope for consent, and it is a worse privacy position than a cookie because it is harder for the user to see or clear.

## Trying cookieless analytics on your own site

If you want to see what analytics looks like when nothing is written to the device, the Privytics free tier is 10,000 events a month, with no credit card. One project, 12 months of retention, and no session replay on the free plan. You can export your data at any time, and because the underlying open-source engine is AGPL-3.0 you can run it yourself instead. Privytics is a newer service than the long-established tools in this space, so judge it on the design, and take that design to your own advisers rather than taking our word for the legal conclusion.
