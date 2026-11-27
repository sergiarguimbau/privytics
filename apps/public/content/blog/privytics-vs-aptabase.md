---
slug: privytics-vs-aptabase
title: "Privytics vs Aptabase: app-first vs product analytics"
description: "Privytics vs Aptabase: free plans, prices, funnels and retention, self-hosting and where your data is stored, side by side."
date: 2026-07-22
updated: 2026-11-27
tag: Comparison
---

Pick Aptabase if you build a mobile or desktop app and only need simple, anonymous event counts at the lowest price. Pick Privytics if you want product analytics for a website or app: funnels, plus retention, cohorts and user profiles for signed-in users you identify. Both are cookieless and open source at the core.

|                    | Privytics     | Aptabase                |
|--------------------|---------------|-------------------------|
| Free plan          | 10k events/mo | 20k events/mo           |
| From               | €10/mo        | $10/mo                  |
| Data stored in     | Germany       | Germany or US           |
| Funnels            | ✓             | ✗                       |
| Retention, cohorts | ✓ ¹           | ✗                       |
| Self-host          | ✗ ²           | ✓                       |
| User profiles      | ✓ ¹           | ✗                       |
| Built for          | Web and apps  | Mobile and desktop apps |

¹ For signed-in users you identify. ² The engine (OpenPanel) is open source. Both set no cookies. Prices excl. VAT.

| Events/month | Privytics | Aptabase |
|--------------|-----------|----------|
| 100k         | €10       | $10 ³    |
| 1M           | €40       | $20      |
| 10M          | €200      | $140     |

³ The $10 tier covers 200k ([Aptabase pricing](https://www.aptabase.com/pricing)). Prices excl. VAT.

## When Aptabase is the better choice

- You build with Flutter, Electron, Tauri, Unity or Unreal: Aptabase has SDKs for all of them.
- You want the lower price, with unlimited apps on the free plan.
- You only need event counts, not funnels or retention.
- You want to self-host the whole product, with an official setup.
- You need your data stored in the US.

## When Privytics fits

- You need funnels to see where users drop off.
- You need retention and cohorts for your signed-in users.
- You want a profile with an event timeline for each signed-in user.
- Your main product is a website or web app, maybe with a mobile app next to it.

## Same anonymous ID, plus one optional step

By default, both tools count visitors the same way: with an anonymous ID that changes every day. So neither can tell that Monday's visitor came back on Tuesday. For developers: both hash the IP address and user agent with a salt that changes every day.

Privytics adds one optional step. Call `identify()` with your own user ID after sign-in, and that person's visits link up across days and devices. This unlocks retention, cohorts, user profiles and cross-session funnels; funnels within one visit work without it.

Those user IDs are personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first. We explain both layers in [funnels, retention and cohorts without cookies](/blog/funnels-retention-cohorts-without-cookies).

Aptabase has no such step, and its own FAQ says it cannot measure monthly active users or retention. A quick test:

- "How often is this button clicked?" Both tools answer it.
- "Where do signed-in users drop off in signup, and do they come back next week?" Only Privytics, with `identify()`.

## Open source and self-hosting

Aptabase is open source: the core is AGPLv3, the SDKs are MIT, and the code has been public since 2023. Privytics is a managed service that runs on OpenPanel, an open-source analytics engine (AGPL-3.0).

You track with the standard OpenPanel SDKs and can export all your data. So you can self-host the engine or move to OpenPanel's own cloud at any time. Privytics is an independent service and is not affiliated with, endorsed by, or sponsored by OpenPanel.

[Privytics vs OpenPanel](/blog/privytics-vs-openpanel) covers that choice in more detail.

## FAQ

### What happens if I go over my plan's limit?

Neither tool charges overage fees: Aptabase pauses analytics until you upgrade or the next month starts. On Privytics, the free plan pauses new events until next month, while paid plans get a warning email and an upgrade prompt.

### Do I need a cookie banner with either tool?

Generally not for anonymous analytics: neither tool sets cookies, and Privytics stores nothing on your visitors' devices. Any other tag on your site that stores data on the device brings the banner back, as our [cookie banner guide](/blog/cookieless-analytics-gdpr-cookie-banner) explains.

### Does Privytics have SDKs for mobile apps?

Yes: [React Native](/for/react-native), [Swift](/for/swift) and [Kotlin](/for/kotlin), plus web frameworks and server SDKs for Node, Python, Ruby, Rust and Java.

### Can I import my Aptabase data into Privytics?

No. Imports on paid plans cover Umami, Mixpanel and Amplitude, so your Privytics history starts the day you add the SDK.
