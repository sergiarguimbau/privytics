---
slug: analytics-for-ai-generated-apps
title: "Analytics for AI-Generated Apps: Setup, Events and Consent"
description: "Add analytics to an app built with Cursor, Claude Code, v0, Lovable or Bolt: one script tag, a few clear events and no personal data."
date: 2026-07-19
updated: 2026-11-27
tag: Guide
---

Paste one script tag into your app's HTML head, then track five to eight clearly named events. That is all an app built with Cursor, Claude Code, v0, Lovable or Bolt needs to show you whether people use it.

The packages are called `@openpanel/*` because Privytics runs on OpenPanel, an open-source analytics engine (AGPL-3.0). Privytics is an independent service and is not affiliated with, endorsed by, or sponsored by OpenPanel.

## Install

Pick the option for your stack. The script tag works in any app and is the hardest install for an agent to get wrong.

### Script tag

Paste this into the `<head>` and replace `YOUR_CLIENT_ID` with the ID from your project:

```html
<script>
  window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:function(){n.push([r].concat([].slice.call(arguments)))}} ,has:function(t,r){return"q"===r}}) }();
  window.op('init', {
    apiUrl: 'https://api.privytics.com',
    clientId: 'YOUR_CLIENT_ID',
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
  });
</script>
<script src="https://privytics.com/op1.js" defer async></script>
```

The first line queues calls until the script loads, so `window.op('track', 'signup_completed')` works straight away. You can also track a click with no JavaScript: add `data-track="signup_completed"` to a button. Platform notes are in our [guide for vibe-coded apps](/for/vibe-coded-apps).

### React and other single-page apps

React uses the web SDK; there is no separate React package.

```bash
npm install @openpanel/web
```

```ts
// op.ts
import { OpenPanel } from '@openpanel/web';

export const op = new OpenPanel({
  apiUrl: 'https://api.privytics.com',
  clientId: 'YOUR_CLIENT_ID',
  trackScreenViews: true,
  trackOutgoingLinks: true,
  trackAttributes: true,
});
```

Import `op` anywhere and call `op.track('checkout_started', { plan: 'pro' })`. Keep `apiUrl`: without it, the npm packages send your events to OpenPanel's hosted API.

### Next.js

```bash
pnpm install @openpanel/nextjs
```

```tsx
// app/layout.tsx
import { OpenPanelComponent } from '@openpanel/nextjs';

export default function RootLayout({ children }) {
  return (
    <>
      <OpenPanelComponent
        clientId="YOUR_CLIENT_ID"
        apiUrl="https://api.privytics.com"
        scriptUrl="https://privytics.com/op1.js"
        trackScreenViews={true}
      />
      {children}
    </>
  );
}
```

`scriptUrl` is optional. Without it, events still arrive; the browser just loads the script from openpanel.dev. In client components, `useOpenPanel()` gives you `track()`.

## What to track first

Start with the moments you would mention in a status update. An agent will happily add forty `track()` calls that nobody can read later.

| Event                | Fires when          | Properties          |
|----------------------|---------------------|---------------------|
| `signup_completed`   | Account created     | `method`, `plan`    |
| `project_created`    | Main object created | `template`          |
| `feature_used`       | Core action         | `feature`, `source` |
| `checkout_started`   | Payment opened      | `plan`              |
| `checkout_completed` | Payment succeeded   | `plan`              |

Page views are tracked for you, so skip a `page_view` event. Rename `project_created` after your product's main object.

- Name events `object_action` in snake_case and the past tense: `invoice_sent`, not `Sent Invoice`.
- Put variations in properties: `checkout_started` with `{ plan: 'pro' }`, not `checkout_started_pro`.
- Write the list into `CLAUDE.md` or `.cursorrules`. Agents follow a written convention far better than one they must guess.

More in our [tracking plan guide](/blog/analytics-tracking-plan-event-naming).

## Keep personal data out of events

Asked to "track the signup", an agent will often send the whole form as properties. Watch for:

- **Properties.** No emails, names, phone numbers or free text.
- **URLs.** Page views record the full URL, so keep tokens and email addresses out of query strings.
- **Errors.** Send a code, not the raw message, which often contains user input.

To see retention and user profiles for signed-in users you identify, call `op.identify({ profileId: user.id })` with your own user ID, never their email. Identified events are personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first.

## Consent

Privytics sets no cookies and stores nothing on your visitors' devices, so anonymous analytics generally needs no cookie banner. Each visitor gets an anonymous ID that changes every day. Other tags on your page, or calling `identify()`, can change the answer.

To ask first, add `disabled: true` to the init options and call `op.ready()` after consent (`window.op('ready')` with the script tag). Calls made before that wait in memory: a single-page app keeps them, a full page reload loses them. More in [do you still need a cookie banner?](/blog/cookieless-analytics-gdpr-cookie-banner)

## Check that events arrive

1. In your browser's developer tools, open the Network tab and filter by `track`. You should see `POST` requests to `api.privytics.com/track`.
2. Add `debug: true` to the init options. Each call then shows in the console with its properties.
3. Open the real-time view in your dashboard. If requests go out but nothing shows, check that the client ID belongs to this project.
4. Trigger each event once and read the properties back. A typo in a key creates a second, near-identical property.

Nothing arriving? Check for:

- **An ad blocker.** Ad blockers block Privytics less often than Google Analytics, but some do. Test in a clean browser profile, or [route it through your own domain](/blog/ad-blockers-analytics-first-party-proxy).
- **A wrong `apiUrl`.** It must be `https://api.privytics.com`.
- **`disabled: true`** with no `ready()` call.
- **A content security policy** blocking the script.

## When another tool is the better choice

- **You run Google Ads.** GA4 links to Google Ads: key events become Ads conversions, and you get audiences for remarketing.
- **You want flags and experiments too.** PostHog is an all-in-one suite with product analytics, feature flags, experiments and surveys, among other tools.
- **You only need visitor counts.** Plausible or Fathom are simpler.
- **Your buyers require SOC 2, SAML single sign-on or a published SLA.** We do not offer those.

## When Privytics fits

- **You want to start free.** Free plan: 10,000 events a month for one project, with 12 months of history, no credit card and no time limit.
- **You want funnels and retention.** Both are on every plan, free included.
- **You care where data lives.** Analytics data is stored in EU data centres in Germany.
- **You want a way out.** You can export all your data, self-host the engine or move to OpenPanel's own cloud at any time.

## FAQ

### Can my coding agent set this up on its own?

Yes, once it has a client ID. Create your project yourself, then give the agent the ID and the snippet for your stack.

### Does this work in Lovable or Bolt?

Yes. Use the script tag, or ask the agent to install `@openpanel/web`: both platforms can install npm packages.

### Can I send events from my server?

Yes. Use the SDK for your backend, such as [Node](/for/node) or [Python](/for/python), with your client ID and client secret. Keep the secret on the server, never in browser code.

### What happens if my app goes over the free plan?

On the free plan, new events pause until next month and nothing is charged; your dashboard stays available. Paid plans are not cut off at their tier limit: you get a warning email and a prompt to upgrade, with no extra charge.
