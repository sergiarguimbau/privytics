---
slug: privytics-vs-amplitude
title: "Privytics vs Amplitude: Cookieless EU Analytics Compared"
description: "Privytics vs Amplitude on price, free plan, cookies, data location and features, and when each one is the better choice."
date: 2026-07-19
updated: 2026-11-27
tag: Comparison
---

Pick Amplitude if you want a much bigger free plan (2M events a month) or advanced tools like experiments and causal analysis. Pick Privytics if you want analytics without cookies, a public price list and data stored in EU data centres in Germany. We make Privytics, so we also say where Amplitude wins.

## At a glance

|                    | Privytics             | Amplitude                      |
|--------------------|-----------------------|--------------------------------|
| Free plan          | 10k events/mo         | 2M events/mo                   |
| From               | €10/mo                | Not listed                     |
| Cookies            | None                  | Yes                            |
| Data stored in     | Germany               | US (EU option)                 |
| Retention, cohorts | ✓ ¹                   | Retention ✓, cohorts from Plus |
| Self-host          | ✗ ²                   | ✗                              |
| History            | 12 mo free, 5 yr paid | 1 yr free, 2 yr Plus           |
| Experiments        | ✗                     | ✓                              |

¹ For signed-in users you identify. ² The engine (OpenPanel) is open source. Both include funnels on every plan. Prices excl. VAT.

## Price by volume

| Events/mo | Privytics | Amplitude  |
|-----------|-----------|------------|
| 100k      | €10       | Free       |
| 1M        | €40       | Free       |
| 10M       | €200      | Not listed |

Prices excl. VAT.

Above 2M events a month, Amplitude Plus (card required) is priced through a bill estimator. Growth and Enterprise are quoted by sales.

## When Amplitude is the better choice

- **Free volume matters most.** Amplitude's free plan holds 200 times more events than ours, with unlimited seats.
- **You run experiments.** Amplitude includes experiments and causal analysis. Privytics has no experiments or A/B tests.
- **You need enterprise security.** SSO and a HIPAA BAA come with Growth and Enterprise, and Amplitude holds its own SOC 2 Type II and ISO 27001 certifications.
- **You want history with no time limit.** Growth and Enterprise have unlimited data access.
- **You already show a consent banner** for other tags, so cookies are not a deciding factor.

## When Privytics fits

- **You want no cookies.** Nothing is stored on your visitors' devices, so anonymous analytics generally needs no [cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).
- **You want a predictable bill.** Fixed monthly tiers, each price listed on [our pricing](/#pricing). A traffic spike inside your tier never changes the bill.
- **You want the core reports for free.** Funnels, user flows, revenue tracking, alerts and custom dashboards are on every plan. So are retention and cohorts, for signed-in users you identify.
- **You want your data in Germany.** Analytics data is stored in EU data centres in Germany, and Privytics is operated from Spain.
- **You want a way out.** Privytics runs on OpenPanel, an open-source engine (AGPL-3.0). You can export all your data and self-host the engine at any time.

## Cookies and returning visitors

Amplitude's browser SDK sets two cookies by default, `AMP_` and `AMP_MKTG_`, and can be configured to run without them. In the EU, storing anything on the visitor's device, cookie or not, generally needs consent first.

Privytics gives each visitor an anonymous ID that changes every day, without storing anything on the device. For developers: the ID is a hash of IP address, user agent and project ID, with a secret salt that rotates at midnight UTC.

The trade-off: an anonymous visitor who returns tomorrow counts as new. Signed-in users you [identify](/blog/funnels-retention-cohorts-without-cookies) with `identify()` are counted once across days and devices. That is personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first.

## FAQ

### Can I bring my Amplitude data to Privytics?

Yes. Paid plans can import your Amplitude data, and you track new events with the standard OpenPanel SDKs ([JavaScript setup](/for/javascript)).

### What happens if I go over my Privytics plan?

On the free plan, new events pause until next month and nothing is charged; your dashboard stays available. Paid plans are not cut off at their tier limit: you get a warning email and a prompt to upgrade, with no extra charge.

### Does Privytics have SSO and team permissions?

Privytics has member roles and per-project access (read, write or admin), and you can sign in with Google or GitHub. There is no SAML or enterprise SSO.

### Is Amplitude GDPR compliant?

Amplitude is certified under the EU-US Data Privacy Framework and offers an EU data centre in Frankfurt on every plan, Free included. With either tool, you still need a lawful basis, a privacy notice and a DPA with the vendor; Privytics includes a [DPA](/dpa) on every plan.
