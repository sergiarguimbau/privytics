---
slug: analytics-tracking-plan-event-naming
title: "Analytics tracking plan and event naming conventions"
description: "How to write an analytics tracking plan: consistent event names, the core events to track, and how to keep the list clean."
date: 2026-07-29
updated: 2026-11-27
tag: Guide
---

An analytics tracking plan is a written list of every event you collect: what triggers it, which properties it carries and who owns it. Pick one naming rule, write it down and keep the plan in your repo next to the code. We recommend `object_action` in snake_case, past tense: `signup_completed`.

## Why tracking gets messy without a plan

A developer ships `Signup Complete`. Months later, another ships `signup_completed`. Your analytics now counts two events, and any funnel built on one of them undercounts.

Then someone builds a name from a variable:

```js
// One event per format, and no chart adds them up
op.track(`${format}_report_exported`);

// One event, split by a property
op.track('report_exported', { format });
```

Segment, Mixpanel and PostHog all warn against names built from variables.

## What a tracking plan contains

| Part | Holds | Prevents |
| --- | --- | --- |
| Event dictionary | Names, triggers | Duplicate names |
| Naming rule | Casing, word order | Guesswork |
| Property schema | Names, types, values | `Pro` vs `pro` splits |
| Owner and status | Who, live or retired | Orphan events |

A file in the repo beats a spreadsheet: an event and its plan entry ship in the same pull request.

## Naming conventions compared

The big vendors do not agree, so there is no industry standard to copy.

| Tool | Word order | Event names |
| --- | --- | --- |
| Segment | Object + action | Title Case |
| Mixpanel | Object + verb | snake_case |
| Amplitude | `verb_noun` | snake_case |
| PostHog | `category:object_action` | snake_case |
| GA4 | None | Letters, digits, `_` |

PostHog uses present tense; Segment sets no tense rule. Segment and Amplitude use snake_case for properties; GA4 sets no rule. Sources: [Segment](https://www.twilio.com/docs/segment/protocols/tracking-plan/best-practices), [Mixpanel](https://docs.mixpanel.com/docs/data-structure/events-and-properties), [Amplitude](https://amplitude.com/explore/data/event-taxonomy), [PostHog](https://posthog.com/docs/product-analytics/best-practices), [GA4](https://support.google.com/analytics/answer/13316687).

## Our rule: object_action, snake_case, past tense

1. **Object first keeps related events together.** In an alphabetical event list, `checkout_started`, `checkout_completed` and `checkout_failed` sit side by side.
2. **snake_case works everywhere downstream.** It needs no quoting or escaping in CSV files, URLs or database columns.
3. **Past tense prevents duplicates.** Without a rule, `checkout_start` and `checkout_started` both end up in your data.

Consistency matters more than the choice: PostHog's present tense works too. Either way, add two rules:

- **Never build a name from a variable.** Put the variable in a property.
- **Keep a closed list of verbs:** viewed, clicked, started, completed, failed, created, updated, deleted, cancelled. A new verb is a conversation, not a commit.

## Core events to start with

| Event | Fires when | Key properties |
| --- | --- | --- |
| `signup_completed` | Account created | `method` |
| `project_created` | First real action | `template` |
| `trial_started` | Trial begins | `plan` |
| `checkout_started` | Payment opens | `plan`, `interval` |
| `plan_upgraded` | Payment succeeds | `from_plan`, `to_plan` |
| `subscription_cancelled` | Cancellation confirmed | `reason` |

There is no page view row: with `trackScreenViews: true`, Privytics tracks each page as `screen_view`, with its path and title. Swap the middle rows for your own activation step, as in the [ecommerce](/for/ecommerce) and [SaaS](/for/saas) guides.

## Property or new event?

Ask one question: **would you ever want these variants on the same chart?**

- **Yes:** it is a property. Signups by email and by Google are one `signup_completed` event with a `method` property.
- **No:** it is a new event. `song_played` and `profile_updated` are separate events, not one generic `button_clicked`.

Then pin down the values. Decide once whether `plan` is `"pro"` or `"Pro"`, and whether revenue is sent in cents (`1999`) or euros (`19.99`). Mix them and your totals are silently wrong.

## When to call identify()

In Privytics, each visitor gets an anonymous ID that changes every day; nothing is stored on the device. Anonymous visits are not linked across days, so retention, cohorts, user profiles and cross-visit funnels work for signed-in users you identify. See [how funnels, retention and cohorts work without cookies](/blog/funnels-retention-cohorts-without-cookies).

- **Call `identify()` once, after login or session restore.** Not on page load, and not before login succeeds.
- **Use your stable internal user ID,** not an email or username. Those change; your primary key does not.
- **Call `clear()` on logout,** so a shared computer does not credit the next person's visit to the previous account.
- **Settle the legal side first.** Calling `identify()` links events to your own user IDs. That is personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first.

## Adding, changing and retiring events

**Adding.** A new event arrives as a pull request against the plan file, reviewed by the owner of that area.

**Changing.** Never rename in place: it breaks saved funnels, charts and alerts, and splits your history. Ship the new name, send both for two to four weeks, move saved reports over, then retire the old one. Both names count as events during the overlap, so keep it short.

**Retiring.** Once a quarter, list every event with no volume in the last 90 days. Watch the total too: Mixpanel's soft limit is 5,000 distinct event names, and getting close usually means names are built from variables.

## A starter template

Owners are team handles, so an event keeps its owner when someone leaves.

```yaml
- event: signup_completed
  trigger: Account created on the server
  properties: { method: string, referral_source: string }
  owner: growth-eng
  status: live
- event: export_downloaded
  trigger: Download completes
  properties: { format: string, row_count: integer }
  owner: data
  status: proposed
```

## How this works in Privytics

You send events with the names from your plan, like `op.track('signup_completed', { method: 'email' })`. Those names are what you see in funnels, dashboards, alerts and the API.

Each page view, outgoing-link click and custom event counts as one event; properties never count extra. A short list of events with rich properties also keeps your bill down. To start, install with the [script tag](/for/script-tag) or your framework's guide.

## FAQ

### Should web and mobile apps use the same event names?

Yes. Use one plan for every platform and send the platform as a property, so `signup_completed` means the same thing everywhere.

### Can I put personal data in event properties?

Keep names, emails and other personal details out of event names and properties. To know who did something, call `identify()` with your internal user ID instead.

### How do I make AI coding tools follow the plan?

Commit the plan file to the repo and tell the assistant to use only names from it. Then review its `track()` calls like any other pull request.
