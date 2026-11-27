---
slug: funnels-retention-cohorts-without-cookies
title: "How funnels, retention and cohorts work without cookies"
description: "How funnels, retention and cohorts work without cookies: an anonymous ID that changes daily, identify() for signed-in users, and the limits."
date: 2026-07-22
updated: 2026-11-27
tag: Guide
---

Funnels within one visit work for every visitor, with no cookies at all. Retention, cohorts and funnels across days work for signed-in users you identify.

The difference comes from two kinds of ID: an anonymous one that changes every day, and your own user ID after sign-in.

![Anonymous visitors get a new ID each day, which covers traffic, events and funnels within one visit. Signed-in users you identify keep one ID across days and devices, which covers profiles, retention, cohorts and funnels across days.](/images/blog/funnels-retention-two-ids.svg)

## Anonymous visitors: a new ID every day

Each visitor gets an anonymous ID that changes every day; nothing is stored on the device. For developers: the ID is a hash of IP address, user agent and project ID, with a secret salt that rotates at midnight UTC.

Since we set no cookies, anonymous analytics generally needs no cookie banner. [Our cookie banner guide](/blog/cookieless-analytics-gdpr-cookie-banner) covers the legal detail and what GDPR still asks of you.

Every event in a visit carries that ID. So a funnel from product page to cart to checkout works for anyone, signed in or not. A visit that runs past midnight is not split in two.

The next day, the same person gets a new ID. Anonymous visitors are not linked across days, which is why retention needs the second kind of ID.

Two smaller effects come from using the IP address. A visitor who switches from Wi-Fi to mobile data gets a new ID. Two people on one network with the same browser and system share one.

## Signed-in users: your own user ID

When someone signs in, call `identify()` with their ID from your own database. From then on, their events link to that ID across days and devices.

```ts
op.identify({
  profileId: '123', // Required
  firstName: 'Joe',
  lastName: 'Doe',
  email: 'joe@doe.com',
  properties: {
    tier: 'premium',
  },
});
```

That unlocks the reports that follow a person, not a visit:

- User profiles with your own traits and a timeline per user
- Retention across days and weeks
- Cohorts grouped by behaviour
- Funnels across visits, such as sign-up to first purchase
- Revenue per user

## How other tools compare

|             | Cookies | Funnels       | Retention, cohorts |
|-------------|---------|---------------|--------------------|
| Plausible   | None    | Business plan | ✗                  |
| Fathom      | None    | ✗             | ✗                  |
| Umami       | None    | ✓             | ✓ ¹                |
| Mixpanel    | Yes     | ✓             | ✓ ²                |
| Amplitude   | Yes     | ✓             | ✓ ³                |
| PostHog     | Yes ⁴   | ✓             | ✓                  |
| Privytics   | None    | ✓             | ✓ ⁵                |

¹ Logged-in users are linked with `umami.identify()`. ² On Free, cohorts can be built but not saved. ³ Behavioural cohorts from the Plus plan. ⁴ Opt-in cookieless mode, with a daily ID like ours. ⁵ For signed-in users you identify.

Umami comes closest to us here: no cookies, plus funnels, retention and cohorts. Mixpanel, Amplitude and PostHog set cookies by default, so in the EU they usually need a consent banner. For one-to-one detail, see [Privytics vs Umami](/blog/privytics-vs-umami), [Privytics vs PostHog](/blog/privytics-vs-posthog) and [Mixpanel alternatives](/blog/mixpanel-alternatives-2026).

## When another tool is the better choice

- **Long anonymous journeys.** If people visit over several days before signing up, a cookie-based tool like Mixpanel, Amplitude or PostHog links those visits.
- **Traffic only.** If visitors, pages and referrers are all you need, Plausible, Fathom or Umami are simpler.
- **Experiments and SQL.** For feature flags, A/B tests, surveys or SQL on raw data, PostHog covers all four.
- **A bigger free plan.** Umami Cloud is free up to 100k events a month, Mixpanel and PostHog up to 1M, Amplitude up to 2M.

## When Privytics fits

- **Signed-in products.** Your key questions are about users with accounts, as in most [SaaS products](/for/saas): activation, retention, feature use.
- **Short funnels.** Your key funnels finish in one visit, or after sign-in.
- **No banner.** You would rather not show anonymous visitors a cookie banner.
- **Data in Germany.** Analytics data is stored in EU data centres in Germany.

## FAQ

### Is identify() personal data?

Yes: once events are linked to your own user IDs, that is personal data, and you choose the lawful basis (often consent). Built-in consent gating lets you ask first.

### Why do weekly unique visitors look higher than in Google Analytics?

An anonymous visitor who returns on another day counts again, so weekly and monthly unique visitors read higher and returning visitors lower. Signed-in users you identify are counted once across days and devices.

### Are funnels, retention and cohorts on the free plan?

Yes, all three are on every plan. The free plan gives you 10,000 events a month for one project, with 12 months of history, no credit card and no time limit.

### What should I do when a user logs out?

Call `op.clear()` on logout, so later events stop being attributed to that user.
