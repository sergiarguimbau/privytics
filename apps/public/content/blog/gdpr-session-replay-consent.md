---
slug: gdpr-session-replay-consent
title: "Is Session Replay GDPR Compliant in 2026?"
description: "Is session replay GDPR compliant? Yes, but only with prior consent, masking by default and short retention. What the CNIL and EDPB actually say."
date: 2026-07-29
updated: 2026-07-29
tag: Compliance
---

Session replay can be GDPR compliant, but never by default and never silently. In the EU it needs prior consent before the recording script runs, because replay is neither strictly necessary to deliver your site nor covered by the narrow audience-measurement exemption. It must then be minimised: text and inputs masked by default, passwords and payment data never collected, and retention in hours or months rather than years.

*General information, not legal advice. We build one of the tools compared below. Positions checked 2026-07-29.*

## What replay records, and why it is personal data

A replay tool loads a script that watches the DOM and streams changes to a server, where they are reassembled into something that plays like a video. The CNIL describes these tools as recreating "the full browsing journey of an internet user on a website or a mobile application", capturing mouse movements, screen touches, clicks, scrolling and, in some cases, form inputs.

A replay can therefore contain whatever was on screen: for a logged-in user, their name, order history or account balance. Even if you never learn who they are, the recording singles them out, which makes it personal data in nearly every deployment. That is the difference from [cookieless analytics](/blog/what-is-cookieless-analytics): an anonymous counter and a per-session recording differ legally.

## Two gates, not one

**Gate one is ePrivacy.** Article 5(3), transposed nationally (Article 82 in France, PECR in the UK), governs reading information from a user's device. The EDPB's [Guidelines 2/2023 on the technical scope of Article 5(3)](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en), adopted in final form in October 2024, confirm this is not a cookie-specific rule: it covers pixel and URL tracking, local processing and unique identifiers. A replay script reading the DOM is inside that scope.

**Gate two is the GDPR.** Processing that data needs an Article 6 lawful basis, plus purpose limitation, minimisation, storage limitation and data subject rights.

## Consent or legitimate interest?

| Basis | Works for replay? | Why |
| --- | --- | --- |
| Strictly necessary exemption | No | CNIL: "not strictly necessary for the provision of the services offered by publishers" |
| Audience measurement exemption | No | Narrow and purpose-bound; replay goes beyond aggregate measurement |
| Legitimate interest alone | No, for collection | ePrivacy gates the read step whatever your GDPR basis |
| Consent | Yes | The realistic answer for collection and, usually, analysis |
| Legitimate interest for later analysis | Sometimes | CNIL: consent is "generally the most appropriate", but controllers assess their own context |

Legitimate interest cannot rescue you at the collection stage. The EDPB's [Opinion 5/2019](https://www.edpb.europa.eu/our-work-tools/our-documents/opinion-board-art-64/opinion-52019-interplay-between-eprivacy_en) set out that where ePrivacy requires consent for an operation, a controller cannot fall back on the full range of GDPR lawful bases for processing that depends on it.

It is not irrelevant: the CNIL leaves room for it in subsequent processing, where the EDPB's [draft Guidelines 1/2024 on Article 6(1)(f)](https://www.edpb.europa.eu/our-work-tools/documents/public-consultations/2024/guidelines-12024-processing-personal-data-based_en), still awaiting a final version, set out a balancing test against the data subject's reasonable expectations. Few visitors expect to be filmed.

## What the regulators actually say

On 25 February 2026 the CNIL opened a public consultation on a [draft recommendation concerning session replay tools](https://www.cnil.fr/en/session-replay-cnil-launches-public-consultation-its-draft-recommendation), running to 22 April 2026. The consultation has closed and a final version is pending as of July 2026. It is a French text, but its stated scope reaches publishers and tool providers across the EU, and anyone processing data on people located there. It "does not have a binding or regulatory nature", so treat it as the clearest signal of regulatory thinking, not settled EU law.

- **Consent is required.** UX optimisation, error detection and support are named as legitimate purposes, and none makes replay strictly necessary.
- **Purposes must be fixed before deployment.** They "cannot be determined after the data has been collected", nor depend on what the tool happens to let you view.
- **Masking should be the default:** "in the absence of configuration, masking should apply by default to all categories considered." Passwords and banking data should not be collected at all.
- **Record less.** Sampling, trigger-based capture and prompt deletion beat blanket recording. Retention: hours after the session for support, months for UX and error analysis.
- **Defaults matter legally.** Providers should "always offer the most protective default settings possible", citing Article 25. Identifiers should be minimal: random per-session ones for UX and error work, a pseudonymous or domain-limited identifier only where support must link a session to a user. Replay is not for retargeting.

The direction elsewhere is consistent: the UK ICO holds that analytics needs consent under PECR, and that a privacy-friendlier tool does not remove the obligation. We are aware of no headline EU fine specifically over replay, so be sceptical of anyone citing one without a decision reference.

## A practical checklist

1. **Gate the script behind consent**, before it loads rather than after.
2. **Mask by default, unmask by exception.** Start from everything hidden, then open up safe elements.
3. **Block passwords and payment data** so they never leave the browser.
4. **Enable replay per project.** Your marketing site and your intake form are not the same risk.
5. **Set a retention period** matching your purpose, and delete what you no longer need.
6. **Sign a DPA** and check where recordings are stored. Ours is at [/dpa](/dpa).
7. **Make withdrawal effective**, and name replay in your privacy notice rather than under "analytics".

## How Privytics implements this

Privytics session replay is off unless you turn it on, per project, and paid-plan only; the free tier has none. When enabled, it masks all text and inputs by default, so you get a structural playback rather than a readable video of someone's screen. Unmasking is opt-in per element. Consent gating is direct: initialise the SDK with `disabled: true` and call `ready()` once the visitor has consented. Event data is stored in EU data centres in Germany.

Masked-by-default is a floor, not a certificate: you still need the banner, the notice and the retention decision, and you remain the controller. The 5-year retention on paid plans describes event data; recordings should be kept only as long as your purpose requires, which per the CNIL is months, not years.

Privytics anonymous analytics is cookieless and generally needs no banner, as we set out in [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner). Replay reintroduces a consent requirement, which is why it ships off by default.

## How masking defaults compare

Defaults decide most outcomes; most teams never change them.

| Tool | Page text masked by default | Inputs masked by default |
| --- | --- | --- |
| **Privytics** | Yes, all text | Yes, all inputs |
| **Microsoft Clarity** | No. The "Balanced" default masks only sensitive content (numbers, emails); "Strict" masks everything but must be selected | Yes, inputs and dropdowns in all modes |
| **Sentry Session Replay** | Yes, `maskAllText` defaults to true; all media blocked in-browser before upload | Yes, `maskAllInputs` defaults to true |

Vendor docs checked 2026-07-29. Clarity is a capable free tool and Privytics is a newer service than it; the point is only that its default does not hide general page text, so change that if you use it on logged-in pages. Fuller comparison: [Privytics vs Microsoft Clarity](/blog/privytics-vs-microsoft-clarity).

## When not to use replay at all

- **Anywhere special category data appears on screen.** Health, biometric, religious or political data pushes you into Article 9, where masking is a fragile control.
- **Payment and banking flows.** The safest way to comply with "block this data" is not to record those pages. The same goes for services aimed at children.
- **Always-on recording of every visitor.** Sample or trigger instead. Recording everything and deciding later what it is for inverts purpose limitation.
- **When aggregate analytics already answers the question.** The CNIL says controllers "should favour the use of alternative tools that process less data, if they enable the same objectives to be achieved."

## FAQ

### Is session replay GDPR compliant?

It can be, with prior consent, masking so personal data is not captured, short retention, a vendor DPA, and disclosure in your privacy notice. Silent recording is never lawful in the EU.

### Do I need consent, or is legitimate interest enough?

Consent, for the collection. ePrivacy governs the act of reading from the device, and a legitimate interests assessment cannot authorise a read that Article 5(3) makes conditional on consent. Legitimate interest may be arguable for what you then do with the recording.

### Does masking mean I do not need consent?

No. Masking is minimisation under Article 5(1)(c), but the ePrivacy trigger is reading information from the device, not how sensitive it turns out to be.

### What has the CNIL said about session replay?

It opened a consultation on 25 February 2026 on a draft recommendation, running to 22 April 2026: prior consent, masking by default, passwords and banking data blocked outright, sampling over blanket capture. The consultation has closed and a final version is pending as of July 2026. It is not binding.

### How long can I keep session recordings?

Only as long as your purpose requires; no statutory number exists. The CNIL suggests a few hours after the session for support, and a few months for UX and error detection.

### Can I use session replay with cookieless analytics?

Yes, though they are governed differently. Cookieless analytics generally avoids the banner because nothing is stored on the device; replay does not. Privytics keeps them separate.
