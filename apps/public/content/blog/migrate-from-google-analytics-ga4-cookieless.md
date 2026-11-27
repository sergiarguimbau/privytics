---
slug: migrate-from-google-analytics-ga4-cookieless
title: "How to migrate from Google Analytics (GA4) to a cookieless tool"
description: "Map your GA4 events, run the new tool next to GA for two weeks, compare trends, keep your GA history, then remove GA. Step by step."
date: 2026-07-22
updated: 2026-11-27
tag: Guide
---

Install the new tool next to GA4, run both for two weeks and compare trends, not totals. Then keep your GA history, remove the GA tag and, if nothing else on your site needs consent, the cookie banner.

## Step 1: Pick one tool

Write down the five to ten questions you answer with GA today, such as "which channel brings signups?". That list is your spec. Then check four things:

- **Cookies.** Choose a tool that sets none by default, or you swap one banner for another.
- **Where data is stored.** Look for the data region, not the company address. Ours: analytics data is stored in EU data centres in Germany.
- **Reports.** Traffic only, or events, funnels and retention too? Match this to your list.
- **Price at your volume.** Most privacy tools bill by monthly page views or events, while GA4 has no usage bill. Count yours first.

Privytics covers traffic, pages and referrers, plus custom events, funnels, and retention and cohorts for signed-in users you identify. If a traffic dashboard is all you need, Plausible or Fathom is a lighter swap.

To weigh the options, read [Privytics vs Google Analytics](/blog/privytics-vs-google-analytics) or our list of [Google Analytics alternatives](/blog/best-google-analytics-alternatives-2026). Then pick one: testing three tools at once is how migrations stall.

## Step 2: Map your GA4 events

GA4 tracks almost everything as an event. Keep only the ones that answer a question on your list. A small map like this becomes your checklist:

| GA4 event | Privytics event | Key event |
|---|---|---|
| `page_view` | `screen_view` (auto) | No |
| `click` (outbound) | `link_out` (auto) | No |
| `sign_up` | `signup_completed` | Yes |
| `purchase` | `revenue` (`op.revenue()`) | Yes |
| `scroll`, `file_download` | Skip | No |

Key events are what GA4 used to call conversions. In Privytics, use each one as the last step of a funnel. `op.revenue()` works from your server, or from the browser once you allow it in project settings.

Put details in properties, not in the event name: `signup_completed` with `plan: 'pro'`, not `signup_pro`. Our [event naming guide](/blog/analytics-tracking-plan-event-naming) has more rules.

## Step 3: Install it next to GA and run both

Keep the GA tag. Add the Privytics snippet to your `<head>` next to it:

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

Replace `YOUR_CLIENT_ID` with your project's client ID and keep `apiUrl` as shown. Then send each event from your map with one call:

```js
window.op('track', 'signup_completed', {
  plan: 'free',
  source: 'pricing_page',
});
```

Using a framework? Follow its setup guide instead, for example [Next.js](/for/nextjs) or [WordPress](/for/wordpress).

Run both tools for at least two weeks, since one campaign or a quiet holiday can skew a single week. Change nothing in your tagging until the run ends.

The free plan covers 10,000 events a month, and each page view, outgoing-link click and custom event counts as one. Past that, new events pause until next month and nothing is charged, but your test stops short. A busier site can use the 100,000-event plan at €10 a month (excl. VAT).

## Step 4: Compare trends, not totals

The numbers will differ, and that is normal. Chart three or four metrics from your list side by side. If both show the same peaks and dips, your tagging works; if one shows a trend the other misses, fix it before you switch.

| Metric | Privytics vs GA4 |
|---|---|
| Daily visitors | Similar or higher ¹ |
| Weekly, monthly visitors | Higher ² |
| Returning visitors | Lower ² |
| Sessions | Defined differently |
| Event totals | Not comparable ³ |

¹ Privytics also counts visitors who decline GA's banner. ² An anonymous visitor who returns another day counts again. ³ GA4 also counts automatic events you did not map.

Both ² rows come from how anonymous visitors are counted. Each visitor gets an anonymous ID that changes every day; nothing is stored on the device. Signed-in users you identify are counted once across days and devices.

[How the daily ID affects funnels and retention](/blog/funnels-retention-cohorts-without-cookies) explains more.

Ad blockers block Privytics less often than Google Analytics, but some do. To recover the rest, you can [route it through your own domain](/blog/ad-blockers-analytics-first-party-proxy).

## Step 5: Keep your GA history

Your GA data stays in GA. Three things keep it useful:

- **Turn on BigQuery export on day one** if you want raw events. It saves events only from the day you link it, and standard properties cap the daily export at 1 million events.
- **Download the reports you cite**, such as channels and top pages by month.
- **Keep the property.** Explorations keep event-level data for 2 or 14 months, but standard reports stay. A standard property costs nothing to keep.

## Step 6: Remove GA, then check the banner

When the trends agree, remove the GA tag and any consent logic tied to it, such as Consent Mode. Do it after a month closes, so your last GA report covers a full period.

Privytics sets no cookies and stores nothing on your visitors' devices, so anonymous analytics generally needs no cookie banner. The banner stays if another tag stores data on the device, such as an ads pixel, a chat widget or an A/B testing tool.

Calling `identify()` links events to your own user IDs. That is personal data: you choose the lawful basis (often consent), and built-in consent gating lets you ask first.

Rules differ by country, so if you are unsure, check with your DPO or lawyer. Our guide to [cookieless analytics and the cookie banner](/blog/cookieless-analytics-gdpr-cookie-banner) walks through the checks.

## FAQ

### Can I import my Google Analytics history into Privytics?

No. Paid plans import from Umami, Mixpanel and Amplitude, not from Google Analytics; Plausible and Matomo can import GA data.

### Can I keep GA4 only for Google Ads?

Yes, for Ads conversions and remarketing audiences, since Privytics has no Google Ads integration. GA4 generally needs consent in the EU, so your cookie banner stays.

### Does Privytics replace Google Search Console?

No. Search Console is a separate Google tool for your search reports, so keep using it.

### Do I need to update my privacy notice?

Yes: replace Google Analytics with the new tool and have a data processing agreement with it. Our [DPA](/dpa) is included on every plan, free included.
