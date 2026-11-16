---
slug: analytics-tracking-plan-event-naming
title: "Analytics tracking plan and event naming conventions"
description: "How to build an analytics tracking plan: the event dictionary, naming conventions compared, core events to track, and governance that stops taxonomy rot."
date: 2026-07-29
updated: 2026-07-29
tag: Guide
---

An analytics tracking plan is a written spec of every event you collect, what triggers it, which properties it carries, and who owns it. It exists so that two engineers instrumenting two features arrive at the same event name without talking to each other. Build it before the first `track()` call, keep it in version control next to the code, and review it on a schedule.

## Why ad-hoc tracking rots

Nobody sets out to build a bad taxonomy. It happens in a predictable sequence.

A developer ships `Signup Complete`. Six months later a second developer ships `signup_completed`. Both fire, and every tool treats them as separate events, because event names are case sensitive almost everywhere: Google's [GA4 naming rules](https://support.google.com/analytics/answer/13316687) state that `my_event` and `My_Event` are distinct. Your signup funnel now undercounts, and nobody notices for a quarter.

Then someone interpolates a variable into a name: `viewed_pricing_page`, `viewed_features_page`, `viewed_docs_page`. Three events where one event with a property was needed, and no chart can total them without a hand-maintained union. [Segment's guidance](https://www.twilio.com/docs/segment/protocols/tracking-plan/best-practices) names exactly this: do not create event names dynamically, do not create events to track properties, do not create property keys dynamically. History becomes unusable at precisely the moment you want to ask a question about it.

## What a tracking plan contains

Segment's definition: a tracking plan "clarifies what events to track, where those events live in the code base, and why those events are necessary from a business perspective". As a working document that becomes four parts, and skipping one causes the rot.

| Part | What it is | Why it matters |
| --- | --- | --- |
| Event dictionary | Every event name, plus what triggers it | Stops two people inventing two names for one action |
| Naming convention | The casing and word-order rule, written down | Makes the right name obvious, not a judgement call |
| Property schema | Per event: names, types, allowed values | Stops `plan: "Pro"` and `plan: "pro"` splitting a metric |
| Owner and status | A named owner, person or team, and a lifecycle state | Someone can say no, and events retire safely |

A spreadsheet works to start. A file in the repo is better: the event and its plan entry land in one pull request.

## Naming conventions compared

The major vendors do not agree.

| Tool | Word order | Event casing | Tense | Property casing |
| --- | --- | --- | --- | --- |
| [Segment](https://www.twilio.com/docs/segment/protocols/tracking-plan/best-practices) | Object + action (`Blog Post` + `Read`) | Title Case | Not stated | snake_case |
| [Mixpanel](https://docs.mixpanel.com/docs/data-structure/events-and-properties) | Object + verb (`page_viewed`) | snake_case recommended | Past | snake_case |
| [Amplitude](https://amplitude.com/explore/data/event-taxonomy) | Your own, applied consistently | lowercase snake_case | Past, in the examples given | Not stated |
| [PostHog](https://posthog.com/docs/product-analytics/best-practices) | `category:object_action` | lowercase snake_case | Present (`submit`, `create`) | snake_case, `object_adjective` |
| [GA4](https://support.google.com/analytics/answer/13316687) | None mandated | Letters, numbers, underscores; must start with a letter | Not stated | snake_case |

Segment and PostHog disagree on casing outright, and Segment states no tense rule at all, so "industry standard" is not an argument for either. (Vendor docs checked July 2026.)

### The recommendation

Use **`object_action` in snake_case, past tense**: `signup_completed`, `project_created`, `plan_upgraded`, `checkout_started`, `teammate_invited`.

1. **Object first sorts usefully.** Event pickers are alphabetical, so `checkout_started`, `checkout_completed` and `checkout_failed` sit together, while the verb-first versions land three screens apart.
2. **snake_case survives everything downstream.** No escaping in a CSV, URL, column name or warehouse table. Mixpanel makes the warehouse-export point directly.
3. **Past tense removes a class of duplicates.** `checkout_start` and `checkout_started` mean the same thing, and both get written unless the rule is unambiguous.

Which you pick matters less than never deviating. PostHog's present-tense style is equally defensible. Two rules to write in explicitly either way:

- **Never build a name from a variable.** `page_viewed` with a `page_name` property, not `pricing_page_viewed`. Every vendor above warns about it.
- **Keep a closed verb list.** Viewed, clicked, started, completed, failed, created, updated, deleted, cancelled. A new verb is a conversation, not a commit.

## Core events worth tracking

Start small. Segment observes that its most successful customers keep the plan to a minimal set of core events with rich properties.

| Event | Fires when | Useful properties |
| --- | --- | --- |
| `page_viewed` | Automatic, from the SDK | `path`, `referrer`, `title` |
| `signup_started` | Signup form submitted | `method`, `plan_intent` |
| `signup_completed` | Server confirms the account | `method`, `referral_source` |
| `project_created` | First real action in the product | `template`, `is_first` |
| `trial_started` | Trial clock begins | `plan`, `trial_days` |
| `checkout_started` | Payment flow opens | `plan`, `interval`, `currency` |
| `plan_upgraded` | Payment succeeds | `from_plan`, `to_plan` |
| `subscription_cancelled` | Cancellation confirmed | `reason`, `tenure_days` |

Swap the middle rows for your own activation moment: `product_viewed`, `cart_updated`, `order_completed` for a shop, as in the [ecommerce guide](/for/ecommerce), or the two or three actions that predict retention for [SaaS](/for/saas).

## Properties or a new event?

One question: **would you ever want these variants on the same chart?**

If yes, it is a property: pricing views and docs views belong on one `page_viewed` split by `page_name`. Mixpanel gives the same example with home and pricing pages. If no, it is a new event. `song_played` and `profile_updated` are different intents, not variants of a generic `button_clicked`.

Type discipline matters as much as naming. Decide once whether `plan` is `"pro"` or `"Pro"`, and whether revenue is minor units or a float. A type that changes between calls breaks aggregations quietly.

## identify() and when to attach identity

Anonymous events answer "how many". Identified events answer "which users, and did they come back". You need identity for retention curves, cohorts and per-user timelines, and nothing else: the split covered in [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics).

- **Call `identify()` once, after login or session restore resolves.** Not on page load, not optimistically.
- **Use a stable internal user id, not an email or username.** Those change; your primary key does not.
- **Traits are a schema too.** List them with types, and put nothing in one you would not want in a support screenshot.
- **Call `clear()` on logout,** so a shared machine does not credit the next session to the previous account.
- **Decide the lawful basis first.** Anonymous and identified analytics are different processing activities, and you remain the data controller.

## Governance: adding, changing, retiring

A plan without a process is a document that was accurate once.

**Adding.** New events arrive as a pull request against the plan file, reviewed by whoever owns that area. Reviewing a proposed name is a minute of work and saves a rename later.

**Changing.** Never rename in place: it breaks every saved funnel, chart and alert, and splits history at an arbitrary date. Ship the new name, fire both for two to four weeks, migrate saved reports, then deprecate the old row.

**Retiring.** Once a quarter, list every event with zero volume in ninety days. Each is dead code, a broken implementation, or an unused feature. Watch the total too: Mixpanel documents a soft limit of 5,000 distinct event names before indexing and autocomplete stop working, and approaching it means dynamic names, not real surface area.

## A starter template you can copy

A blank skeleton, not anyone's real plan. Owners are role handles, so nobody leaving orphans a row.

| Event | Trigger | Properties (type) | Owner | Status | Added |
| --- | --- | --- | --- | --- | --- |
| `signup_completed` | Account row created | `method` (string), `referral_source` (string) | `growth-eng` | live | YYYY-MM-DD |
| `checkout_started` | Checkout page mounts | `plan` (string), `interval` (string) | `payments` | live | YYYY-MM-DD |
| `export_downloaded` | Download completes | `format` (string), `row_count` (integer) | `data` | proposed | YYYY-MM-DD |

## How this maps to Privytics

Privytics has no fixed event schema, so the plan is the schema. You call `op.track('signup_completed', { method: 'email' })` with the names you chose, and those names appear in the funnel builder, dashboards and API. Install with the [script tag](/for/script-tag) or a framework snippet.

Funnels are built from your event names in order, so a funnel is only as consistent as the names underneath it. Retention, cohorts and profiles need `op.identify({ profileId, email, properties })`, with `op.clear()` on logout. Anonymous visitors are counted by a daily-rotating salted hash of IP, user agent and project id, with nothing written to the device. Billing is by event in stepped tiers, free up to 10,000 a month, so fewer, better-named events means fewer billed events. More in [how funnels, retention and cohorts work without cookies](/blog/funnels-retention-cohorts-without-cookies).

## FAQ

### What is an analytics tracking plan?

A written spec listing every event your product sends, what triggers each one, which properties it carries with their types, and who owns it. Keep it in version control alongside the code.

### Should event names be object_action or action_object?

Object first: `checkout_started` rather than `started_checkout`. Vendors do not agree on word order, but object-first groups related events together in an alphabetical picker, which matters once you pass a hundred events.

### Should I use snake_case or Title Case for event names?

snake_case, for events and properties alike. Segment recommends Title Case events with snake_case properties, a genuine split in the market, but snake_case needs no escaping in warehouses, CSVs or URLs.

### When should something be a property instead of a new event?

If you would ever want the variants compared on a single chart, make it a property: pricing views and docs views are one `page_viewed` event with a `page_name`. Different intents that would never share an axis are separate events.

### How do I rename an event without breaking my charts?

Do not rename in place: it splits your history and breaks every saved report. Ship the new name, fire both for a two to four week overlap, migrate saved reports, then stop the old one and mark it deprecated.

### Do I need identify() to use a tracking plan?

No. Anonymous tracking answers volume and conversion questions perfectly well. `identify()` is needed only for retention curves, cohorts and per-user timelines, which join sessions to a person. It is a separate decision with its own lawful basis.
