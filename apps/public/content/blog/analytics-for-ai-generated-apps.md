---
slug: analytics-for-ai-generated-apps
title: "Analytics for AI-Generated Apps: Setup, Events and Consent"
description: Analytics for AI-generated apps built with Cursor, Claude Code, v0, Lovable or Bolt. Script tag, React and Next.js snippets, event naming, PII rules, consent.
date: 2026-07-19
updated: 2026-07-29
tag: Guide
---

If you generated an app with Cursor, Claude Code, v0, Lovable or Bolt and now want to know whether anyone is using it, the fastest correct answer is a single script tag plus a small, deliberately named set of events. The install takes a few minutes. The part that decides whether the data is still useful in three months is the event taxonomy, the rules you set about what never goes into a property, and whether tracking is gated behind consent. This guide covers all of it, with snippets you can paste as they are.

The concrete snippets use Privytics because that is what we run, but the taxonomy, naming, PII and verification sections are tool-agnostic and worth following whichever vendor you pick.

One thing to explain up front, because it shows up in the package names below. Privytics is a managed, EU-hosted service that runs the open-source OpenPanel engine, which is licensed AGPL-3.0. That is why the npm packages are called `@openpanel/*`. Privytics is an independent service and is not affiliated with, endorsed by or sponsored by OpenPanel. If you would rather buy hosting from the upstream project or run the engine on your own infrastructure, OpenPanel Cloud and self-hosting are both reasonable choices, and every snippet here works with them once you point `apiUrl` and `scriptUrl` at that deployment.

## The 30-second install

Paste this into your HTML `<head>` and replace `YOUR_CLIENT_ID`. Nothing else is required.

```html
<script>
  window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:function(){n.push([r].concat([].slice.call(arguments)))}} ,has:function(t,r){return"q"===r}}) }();
  window.op('init', {
    clientId: 'YOUR_CLIENT_ID',
    apiUrl: 'https://api.privytics.com',
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
  });
</script>
<script src="https://privytics.com/op1.js" defer async></script>
```

That stub queues calls made before the main script finishes loading, so `window.op('track', ...)` is safe to call immediately, including from inline handlers rendered by an agent.

With `trackAttributes: true` you can track a click without writing any JavaScript at all, which is useful when the generated code is JSX you would rather not touch:

```html
<button type="button" data-track="signup_started" data-plan="free">Start free</button>
```

## React (Vite, TanStack Start, Remix, any SPA)

React is covered by the web SDK rather than a package of its own. Install it, create one shared instance, import it where you need it.

```bash
npm install @openpanel/web
```

```ts
// src/analytics.ts
import { OpenPanel } from '@openpanel/web';

export const op = new OpenPanel({
  clientId: import.meta.env.VITE_PRIVYTICS_CLIENT_ID,
  apiUrl: 'https://api.privytics.com',
  trackScreenViews: true,
  trackOutgoingLinks: true,
  trackAttributes: true,
});
```

```tsx
import { op } from '@/analytics';

export function UpgradeButton({ plan }: { plan: string }) {
  return (
    <button onClick={() => op.track('checkout_started', { plan })} type="button">
      Upgrade
    </button>
  );
}
```

The client id is not a secret. It is sent from the browser on every request by design, so putting it in a `VITE_`-prefixed variable is fine. Do not put a client secret in browser code.

## Next.js (App Router)

```bash
npm install @openpanel/nextjs
```

```tsx
// app/layout.tsx
import { OpenPanelComponent } from '@openpanel/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OpenPanelComponent
          apiUrl="https://api.privytics.com"
          clientId={process.env.NEXT_PUBLIC_PRIVYTICS_CLIENT_ID!}
          scriptUrl="https://privytics.com/op1.js"
          trackScreenViews
          trackOutgoingLinks
        />
        {children}
      </body>
    </html>
  );
}
```

The `scriptUrl` prop matters. Leave it out and the component loads the upstream default script host, which will not talk to your project. Set both `apiUrl` and `scriptUrl` and it is wired correctly.

In client components use the hook:

```tsx
'use client';
import { useOpenPanel } from '@openpanel/nextjs';

export function SaveButton() {
  const { track } = useOpenPanel();
  return <button onClick={() => track('document_saved')} type="button">Save</button>;
}
```

## Which install to use

| | Script tag | `@openpanel/web` | `@openpanel/nextjs` |
| --- | --- | --- | --- |
| Best for | static sites, Lovable/Bolt/v0 output, anything without a build step | Vite, Remix, TanStack Start, any React SPA | Next.js App Router or Pages Router |
| Build step needed | No | Yes | Yes |
| Route changes tracked | `trackScreenViews: true` | `trackScreenViews: true` | `trackScreenViews` prop |
| Typed `track()` calls | No | Yes | Yes |
| Declarative `data-track` | Yes | Yes | Yes |
| First-party proxy built in | No | No | Yes, via `createRouteHandler` |
| Time to first event | A few minutes | About 5 minutes | About 5 minutes |

## What to track first

Resist the instinct to instrument everything. An agent will happily add forty `track()` calls and you will end up with forty event names nobody can interpret. Start with five to eight events that map to the moments you would actually mention in a status update. If you have only ever used a pageview tool, the shift in thinking is worth reading first: [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics) covers what events buy you that pageviews do not. A workable starting taxonomy:

| Event | When it fires | Useful properties |
| --- | --- | --- |
| `signup_completed` | account created | `method`, `plan` |
| `onboarding_completed` | user finishes first-run flow | `steps_completed` |
| `project_created` | first real unit of value created | `template` |
| `checkout_started` | user opens the payment flow | `plan`, `interval` |
| `checkout_completed` | payment succeeds | `plan`, `interval` |
| `feature_used` | the core action of your product | `feature`, `source` |
| `error_shown` | user-visible failure | `code`, `surface` |

Page views are already covered by `trackScreenViews`, so do not add a manual `page_view` event.

### Naming conventions

Pick one shape and never deviate. The convention that survives contact with a team is `object_action`, snake_case, verb in the past tense:

- Good: `invoice_sent`, `project_deleted`, `trial_started`
- Bad: `Sent Invoice`, `click-upgrade-btn`, `userDidThing`, `signup` (which half of the funnel?)

Two rules that save you later. First, put variation in properties, not in names. Track `checkout_started` with `{ plan: 'pro' }` rather than creating `checkout_started_pro`, because otherwise every new plan needs a code change and every chart needs updating. Second, property keys use the same snake_case, and property values stay low-cardinality where you intend to group by them.

If you are working with a coding agent, write the taxonomy into your `CLAUDE.md`, `.cursorrules` or equivalent. Agents follow a written convention reliably and invent a new one every time if you do not give them one. Once the app outgrows a handful of events, keeping the list in version control as a proper [tracking plan with agreed event names](/blog/analytics-tracking-plan-event-naming) is what stops it drifting.

## How to avoid tracking personal data by accident

This is the failure mode that actually bites generated code, because an agent asked to "track the signup" will cheerfully pass the whole form object as properties.

- Never put emails, names, phone numbers, addresses, raw IP addresses or free-text input into event properties. Use `identify()` with your own stable user id when you need to attribute behaviour to a person, and let the profile hold traits.
- Watch URLs. If your app puts a password reset token, an email address or an invite code in a query string, screen view tracking will capture it. Strip those params server-side, or move them to fragments or POST bodies.
- Watch error events. Exception messages routinely contain user input. Send a code and a surface, not the raw message.
- Never pass an object you did not construct by hand. `op.track('form_submitted', formValues)` is how PII gets into an analytics database.

A useful review prompt for your agent: "list every property key sent to analytics in this repo and flag any that could contain user-entered text". It catches most of it in seconds.

For identified users, call identify with an id that is yours, not the user's email:

```ts
op.identify({
  profileId: user.id,
  properties: { plan: user.plan, signup_source: user.source },
});
```

## Consent gating

Privytics is cookieless by default and writes nothing to the device for anonymous analytics, and the anonymous visitor id is a daily-rotating salted hash of IP address, user agent and project id, so it cannot follow a person across days. That is a design choice, not a legal opinion. Whether you need consent depends on your jurisdiction, what else is on the page, and whether you call `identify()`. You remain the data controller and are responsible for your own compliance position, so get your own advice rather than trusting any vendor's marketing page, including ours. We work through the reasoning in more detail in [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner).

If you do need a consent gate, the pattern is two lines. Initialise with `disabled: true`, then call `ready()` after the user accepts:

```ts
export const op = new OpenPanel({
  clientId: import.meta.env.VITE_PRIVYTICS_CLIENT_ID,
  apiUrl: 'https://api.privytics.com',
  trackScreenViews: true,
  disabled: true,
});

// later, in your consent banner handler
onAccept(() => op.ready());
```

Script tag equivalent: add `disabled: true` to the `init` object and call `window.op('ready')` on accept.

Events fired before `ready()` are queued in memory rather than dropped, and each carries the timestamp of the moment it happened, so a visitor who accepts after browsing three pages still contributes an accurate sequence. If consent is declined, do nothing: the queue is discarded when the tab closes and nothing is sent.

## Verifying events are arriving

Do this before you move on, because a silent misconfiguration will cost you a week of data.

1. Open the app with devtools on the Network tab, filter by `track`, and confirm you see `POST` requests to `api.privytics.com/track` returning 200 or 202.
2. Add `debug: true` to your init options temporarily. Every `track` and `identify` call is logged to the console with its resolved properties, which is the fastest way to see that a property you expected is `undefined`.
3. Check the live events view in the dashboard. Events appear within seconds, so if the network request succeeded but nothing lands, the client id is wrong or points at a different project.
4. Trigger every event in your taxonomy once, by hand, then read the property values back. Typos in property keys do not error, they just create a second, near-identical column.

Common causes when nothing arrives: an ad blocker (test in a clean profile, and if the loss matters, [serving analytics from your own domain](/blog/ad-blockers-analytics-first-party-proxy) is the usual fix), reliance on your host's bundled analytics (if you deploy to Vercel, [its Web Analytics has plan-level limits worth knowing](/blog/privytics-vs-vercel-analytics)), `apiUrl` left at a default that is not yours, `scriptUrl` not overridden in the Next.js component, `disabled: true` with no `ready()` call, or a content security policy blocking the script host.

## What makes an analytics tool a good fit for agent-generated code

Not every tool installs cleanly when a coding agent is doing the wiring. The traits that matter:

- **One script tag, no build step.** Agents working in v0, Lovable or Bolt often cannot add dependencies or touch bundler config. If the only supported install is an npm package plus a provider component plus an environment variable, the agent will get part of it wrong.
- **A queueing stub.** Without one, any `track()` call that lands before the main script loads is silently lost, and generated code is full of calls at module scope.
- **Sane defaults.** Screen views, outgoing links and declarative attributes should work from the init object without extra plumbing.
- **A free tier with no card.** An agent can wire up an integration end to end. It cannot enter your payment details, and it should not be asked to. If the tool requires a card to emit a single event, the task stalls.
- **Documentation an agent can follow literally.** Copy-pasteable blocks with explicit values beat prose describing options, and a REST API plus data export mean a wrong early choice is recoverable.

## When another analytics tool is the better choice

We would rather you pick correctly than pick us.

- **You run paid acquisition and need ad platform attribution.** Google documents a direct link between a GA4 property and a Google Ads account: auto-tagging that appends a click id to your ad URLs, Google Ads conversions created from the key events you define in Analytics, and Analytics audiences published back to Ads for remarketing. That is a tighter loop than independent tools generally offer. If your reporting is built around ad spend, use GA4, possibly alongside something else.
- **You need feature flags, experiments and analytics in one system.** PostHog bundles them. Wiring flags to a separate service is real work you can avoid.
- **You only want to know how many people visited.** Plausible or Fathom are simpler, and simpler is a genuine feature. Product analytics adds concepts you will not use.
- **You have a data team and an existing warehouse.** Model events there and put a BI tool on top. A hosted product analytics tool adds a second source of truth.
- **You need enterprise procurement, SOC 2 evidence or a contractual SLA today.** Privytics is a newer service than the established vendors in this space, and it does not offer that paperwork. If procurement is the gate, pick a vendor that already clears it.
- **You want no third-party dependency, or you would rather buy from the upstream project.** The engine is AGPL-3.0, so you can self-host OpenPanel and run it entirely yourself. OpenPanel also sells hosted plans of its own, open for signups as of July 2026, which is the natural pick if you would rather buy from the upstream team than from an independent operator.

## FAQ

### How do I add analytics to a Lovable or Bolt app?

Paste the script tag into the app's HTML head, with your client id and `apiUrl` set. Neither platform needs a build step change for this, and the queueing stub means any tracking calls in generated components still work. The [vibe-coded apps](/for/vibe-coded-apps) page covers the same setup for those platforms.

### Will my AI coding agent be able to set this up on its own?

Yes, if you give it the client id and point it at documentation with literal snippets. It cannot create the account or enter payment details, which is why a free tier with no card requirement matters for this workflow.

### Does adding analytics require a cookie banner?

Privytics sets no cookies and writes nothing to the device for anonymous analytics, and the anonymous visitor id is a daily-rotating salted hash that resets at midnight UTC. That is a description of the design, not legal advice. What consent you need depends on your jurisdiction, on everything else running on the page, and on whether you call `identify()`, and you remain the data controller for your own analytics data. Either way the gate is built in: initialise with `disabled: true` and call `ready()` on accept.

### How many events should I track at the start?

Five to eight. Instrument the moments that define whether the product worked for the user, add more when you hit a question you cannot answer, and never add an event just because it was easy.

### Why are my events not showing up?

Almost always one of the causes listed in the verification section above, and the Network tab tells you which one within a minute. Start there rather than rewriting your tracking calls.

### Can I track server-side events too?

Yes. Server-side tracking uses `@openpanel/sdk`, initialised with a client id and a client secret, and there are Express, Python, Ruby, Rust, Java, Swift and Kotlin SDKs plus a REST API. It is the right place for events that must not depend on the browser, like payment webhooks. Separately, `@openpanel/nextjs/server` exports `createRouteHandler`, which proxies the tracking script and browser events through your own domain rather than sending them server-side.

## Getting started

The free tier is 10,000 events a month, with no credit card. One project, 12 months of retention, community support, no SLA. That is enough to instrument a side project properly. Analytics event data is stored in Germany, you can export it at any time, and since the engine is AGPL-3.0, self-hosting is always available as an exit.
