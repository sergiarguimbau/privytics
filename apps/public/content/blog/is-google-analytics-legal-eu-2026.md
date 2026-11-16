---
slug: is-google-analytics-legal-eu-2026
title: "Is Google Analytics legal in the EU in 2026?"
description: "Is Google Analytics legal in the EU in 2026? Yes, conditionally. How the cookie-consent rules and the US data-transfer framework apply, and the risk you carry."
date: 2026-07-22
updated: 2026-07-29
tag: Compliance
---

"Is Google Analytics illegal in the EU?" is one of the most Googled questions in analytics, and almost every answer you find is wrong in one direction or the other. Some blogs say it was banned in 2022 and never recovered. Others wave it away and say the Data Privacy Framework fixed everything. The real answer sits in between, and it depends on which of two separate legal questions you are actually asking.

This post walks through both questions, the 2022 rulings that started the panic, what changed in 2023, and where things genuinely stand in 2026. We build cookieless analytics for a living, so we have a horse in this race, and we will be upfront about that below. But the goal here is the honest version, not a scare piece.

Details and dates were last checked 2026-07-29. Laws and product settings change, so verify current figures before you act on them. This is general information, not legal advice. If you have real exposure, talk to a data protection lawyer.

## The two questions people mix up

Almost every confused Google Analytics debate collapses two different legal questions into one. They have different laws behind them and different answers.

**Question one is about cookies and consent.** This is governed by the ePrivacy Directive, the "cookie law." Standard Google Analytics reads and writes cookies on the visitor's device. Under ePrivacy, storing or accessing non-essential information on someone's device requires prior consent. So if you run standard GA without a working consent banner, you have an ePrivacy problem regardless of where the data ends up. This has been true for years and the Data Privacy Framework does nothing to change it.

**Question two is about sending personal data to the United States.** This is a GDPR question about international transfers. Google is a US company, and analytics data (including IP addresses and identifiers) has historically been processed on US infrastructure. GDPR only allows transfers to a non-EU country if that country offers adequate protection or you put valid safeguards in place. This is the question the 2022 rulings were about, and it is the one the 2023 framework actually addresses.

Keep these separate. You can be compliant on one and not the other.

## The 2022 rulings that started the panic

The transfer question blew up because of a chain of events that started with a court case called Schrems II.

On 16 July 2020, the Court of Justice of the EU (CJEU) issued the Schrems II judgment and invalidated the Privacy Shield, the framework that had allowed EU-to-US data transfers. That left companies using US services on shakier legal ground.

The privacy group noyb then filed 101 near-identical complaints across the EU targeting sites using Google Analytics and Facebook. Regulators started ruling on them:

- **Austria, decided 22 December 2021.** The Austrian data protection authority (DSB) issued the first decision on the 101 complaints (case reference 2021-0.586.257) and found that the GA transfers to the US were unlawful. noyb published it on 13 January 2022, which is why that January date is the one most articles quote.
- **Italy, 9 June 2022.** The Italian Garante, in the Caffeina Media case, ruled that using Google Analytics without adequate safeguards for the US transfer breached GDPR and gave a 90-day window to comply.
- **France, February 2022.** The French regulator CNIL issued formal notices to website operators along the same lines, aligned with the Austrian and Italian reasoning.

This is where the "Google Analytics is banned in the EU" headlines came from. They were not wrong at the time, but every one of those rulings predates July 2023, which is when the transfer question changed.

## What changed in 2023: the Data Privacy Framework

On 10 July 2023, the European Commission adopted an adequacy decision for the EU-US Data Privacy Framework (Commission Implementing Decision (EU) 2023/1795). In plain terms, the Commission decided that the US, for companies that self-certify to the framework, provides an adequate level of data protection.

Two facts matter for Google Analytics specifically:

1. **Google is certified.** Google LLC, and its wholly-owned US subsidiaries unless explicitly excluded, has certified that it adheres to the DPF principles, covering the EU-US and Swiss-US frameworks plus the UK extension. That is Google's own statement on its data-transfer frameworks page, checked July 2026. Certifications are renewed annually and can lapse, so confirm the current entry yourself on the official participant list at dataprivacyframework.gov rather than taking our word or Google's.
2. **A certified transfer is a lawful transfer.** For a company transferring data to a DPF-certified US recipient, the transfer no longer needs the extra contractual gymnastics that the 2022 rulings found insufficient.

This is the single most important thing the panic-piece blogs get wrong. The 2022 decisions were decided under the post-Schrems-II vacuum. The DPF materially changed the legal picture for the transfer question. Citing a January 2022 Austrian ruling as proof that GA is illegal in 2026, without mentioning the framework that came 18 months later, is either lazy or dishonest.

That does not make the transfer question closed forever. It makes it conditionally resolved, and the condition is that the DPF stays valid.

## Where things stand in 2026

Here is the honest 2026 status, and it has two moving parts.

The DPF survived its first major court test. A French member of parliament, Philippe Latombe, challenged the adequacy decision. On 3 September 2025, the General Court (in Latombe v Commission, T-553/23) dismissed the challenge and upheld the framework, holding that the US ensures an adequate level of protection. That was a win for GA users.

But it is not the end of the road, for two reasons:

- **The Latombe case is under appeal.** Latombe appealed to the CJEU on 31 October 2025 (Case C-703/25 P). It was still pending as of July 2026, with Microsoft granted leave to intervene on the Commission's side. The General Court is not the final word, and the CJEU is the same court that struck down both Safe Harbor and Privacy Shield.
- **A new threat emerged in mid-2026.** On 29 June 2026, the US Supreme Court ruled in Trump v. Slaughter (6-3) and overruled a 1935 precedent, removing the for-cause protection that shielded Federal Trade Commission commissioners from being fired at will. The FTC is one of the independent oversight bodies the DPF adequacy finding leans on. The day after the ruling, on 30 June 2026, noyb announced it would challenge the DPF at the CJEU, arguing the decision undermines the "independent and effective supervision" EU law requires, and asked the Commission for an orderly wind-down rather than a sudden collapse.

So as of July 2026, the DPF remains formally in force. It has not been repealed or invalidated. But it is under active legal pressure from both directions at once. If you are betting on Google Analytics for the long term, that is the risk you are carrying.

## So, is Google Analytics legal in the EU right now?

Here is the candid version.

**On the transfer question:** yes, conditionally. If you use standard Google Analytics in 2026, your US transfer is covered because Google is DPF-certified and the framework is in force. That is a real, defensible legal basis today, not a loophole. The caveat is that it rests on an adequacy decision facing two live legal challenges, and this exact category of decision has been struck down twice before.

**On the cookie question:** only if you do consent properly. Standard GA sets cookies, so ePrivacy requires prior consent. You need a genuine consent banner, GA should not fire before the visitor agrees, and you need to honour a "no." Deploying GA and firing it on page load with no consent is a straightforward ePrivacy violation, DPF or not. Google Consent Mode v2 is the plumbing that passes the visitor's choice back to Google's tags, but it is a way to respect an answer, not a way to skip the question, which is why some sites end up looking at [alternatives to Consent Mode v2](/blog/google-consent-mode-v2-alternative) rather than more consent tooling.

One product detail worth date-stamping: on standard GA4 properties, the user-level and event-level data retention setting offers 2 or 14 months, and Google's own help page states that the setting affects explorations and funnel reports but not standard aggregated reports. That is a Google product setting, not a legal ruling, and Google can change it, so treat it as accurate as of July 2026 rather than a permanent guarantee.

Net: Google Analytics is not banned in the EU in 2026. It is lawful to use with proper consent and under the DPF. It is also the option carrying the most regulatory tail risk, because its legal footing depends on a framework two separate parties are actively trying to tear down.

## The cookieless, EU-hosted way to avoid the question

The reason this whole debate exists is that Google Analytics triggers both questions at once: it sets cookies (ePrivacy) and it sends data to the US (GDPR transfers). Change those two facts and the questions mostly stop applying to your anonymous traffic.

That is the approach we take with Privytics. It is managed, cookieless product analytics built on the open-source OpenPanel engine, with analytics event data stored in Germany. Privytics is an independent service and is not affiliated with OpenPanel.

- **Event data stored in the EU, so question two mostly falls away.** Analytics event data is stored in EU data centres in Germany, so your tracking does not lean on the DPF the way a US-hosted tool does. A few supporting services, such as billing and transactional email, are run by US companies under standard contractual clauses, and our [privacy policy](/privacy) lists them.
- **No cookies, so question one does not arise for anonymous visitors.** Instead of a cookie, the visitor id is a daily-rotating salted hash of IP, user agent, and project id, which is the mechanism we unpack in [what cookieless analytics actually is](/blog/what-is-cookieless-analytics). Nothing is stored on the device, and the salt rotates every day, so the id cannot follow someone across days. For the anonymous case, that generally means you do not need a [cookie consent banner](/blog/cookieless-analytics-gdpr-cookie-banner) at all.

This is the honest version of the pitch, so here are the limits. This clean "no consent needed" story holds for anonymous analytics. The moment you call identify() to tie sessions to a real user id across devices, you are doing identified tracking, which is opt-in and carries its own consent and GDPR obligations. Cookieless does not mean GDPR stops applying either: you still owe transparency, a privacy policy, and the usual data-subject rights. It means you have removed the two specific triggers that make the Google Analytics debate so fraught.

We compare the two tools directly, feature by feature and price by price, in [Privytics vs Google Analytics](/blog/privytics-vs-google-analytics). This piece is about the law, not the feature grid.

## When another tool is the better choice

We are not going to pretend Privytics is right for everyone. It loses in real, common cases:

- **You need full web analytics, not product analytics.** Privytics is product analytics: custom events, funnels, retention, cohorts, per-user profiles, dashboards. If you are not sure which of the two you are shopping for, [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics) draws the line. If your actual need is marketing attribution, channel and campaign reporting, and Google Ads integration, Google Analytics does that natively and Privytics does not.
- **You are deep in the Google stack.** If your business runs on Google Ads and needs conversion data flowing straight back into that ecosystem, GA's integration is a genuine advantage no third-party tool matches.
- **You have very high volume and tight budgets.** Privytics is free up to 10,000 events a month, then moves to stepped paid tiers (as of July 2026, EUR 10 a month for 100k events and EUR 40 for 1M, excluding VAT). Standard Google Analytics stays free at volumes where a paid analytics bill would sting.
- **You want a vendor with a long track record.** Privytics is a newer service than Google Analytics, Plausible or Fathom, which have been operating for years. If you need enterprise contracts and a decade of history behind the tool, that is a fair reason to pick someone else. Established, cookieless alternatives are worth a look if web analytics is what you actually want: Plausible is EU-hosted, and Fathom is a Canadian company whose documentation states that its EU isolation is enabled by default on every plan, routing EU pageviews through European servers and stripping the visitor's IP address inside the EU so it never reaches Fathom's US infrastructure (checked July 2026).

The point of going cookieless and EU-hosted is not that it is better at everything. It is that it removes the specific legal questions this article is about. If those questions are not your bottleneck, GA may be the pragmatic pick.

## FAQ: Google Analytics, consent and EU law

### Is Google Analytics banned in the EU?

No. It was found unlawful in specific cases decided in late 2021 and 2022, before the Data Privacy Framework existed. Since the DPF took effect in July 2023 and Google certified to it, standard GA has a lawful transfer basis. It is conditionally legal in 2026, not banned.

### Do I still need a cookie consent banner for Google Analytics?

Yes. The DPF only addresses the US transfer question. Standard GA sets cookies, and the ePrivacy Directive requires prior consent for that, so you still need a working consent banner and GA should not fire before the visitor agrees.

### Could the Data Privacy Framework be struck down again?

It could. The CJEU has invalidated the two previous US frameworks. As of July 2026 the DPF is in force but faces two live challenges: the Latombe appeal (C-703/25 P) at the CJEU, and a new noyb challenge announced 30 June 2026 after the US Supreme Court weakened FTC independence in Trump v. Slaughter.

### Is cookieless analytics automatically legal with no consent?

Not automatically. A cookieless, EU-hosted setup removes the two big triggers (device storage and US transfer), which for anonymous traffic usually means no consent banner is needed. But GDPR still applies: you owe transparency and data-subject rights, and identified, cross-device tracking is opt-in and needs consent.

### Is this legal advice?

No. This is general information reviewed on 2026-07-29, and the underlying law and product settings change. For anything with real exposure, get advice from a qualified data protection lawyer in your jurisdiction.

## Trying Privytics

If the whole reason you are reading this is that you want the compliance question off your plate for your anonymous traffic, that is exactly the gap Privytics is built for: managed, cookieless, EU-hosted product analytics with no consent banner needed for the anonymous case.

The free tier is 10,000 events a month on one project, no credit card, with 12-month retention. Paid plans are stepped tiers by event volume and add session replay and 5-year event history. It is product analytics rather than full web analytics, so read the section above on when another tool is the better choice before you switch. If it fits, it takes the two hardest questions in this article and makes them mostly stop applying to your anonymous traffic.
