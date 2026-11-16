---
slug: migrate-from-google-analytics-ga4-cookieless
title: "How to migrate from Google Analytics (GA4) to a cookieless tool"
description: "How to migrate from Google Analytics (GA4) to a cookieless tool: run both in parallel, map your events, check the numbers, export GA history, then cut over."
date: 2026-07-22
updated: 2026-07-29
tag: Guide
---

Google Analytics 4 is free, powerful, and installed on a large share of the web. It is also a cookie-based tool from an advertising company, which is why so many teams end up looking for something calmer: fewer cookies, less consent friction, and data hosted in the EU. Moving off GA4 is not hard, but it is easy to do badly. The three classic mistakes are cutting over in a single weekend, expecting the new tool to match GA's numbers exactly, and deleting GA before exporting anything.

This guide walks the migration the boring, safe way. You install the new tool next to GA4, run both in parallel for a couple of weeks, map your events, check that the shape of the data agrees, keep your GA history somewhere read-only, and only then remove GA. If your new tool is cookieless, the reward at the end is dropping the consent banner for anonymous visitors.

*GA4 details were last checked against Google's own documentation on 2026-07-29. Google changes GA naming and limits often, so verify current figures before acting. Nothing here is legal advice. Whether you can drop a consent banner depends on your full stack and jurisdiction, so confirm with your DPO or counsel.*

## What you are actually migrating away from

GA4 is really two tools wearing one tag. There is the **web analytics** half (pageviews, sessions, traffic sources, landing pages) and the **product analytics** half (custom events, funnels, retention, cohorts). Most teams lean on one more than the other, and which one you rely on decides what you should replace GA with.

If you mostly stare at pageviews and traffic sources, you want a **web analytics** replacement, and a tool like Plausible, Fathom, or Umami is a closer match. If you live in events, funnels, retention, and per-user behaviour, that is **product analytics**, and that is a different category of tool. It is worth being clear-eyed about this before you pick, because a mismatch here is the reason most migrations feel disappointing. We wrote a longer breakdown in [product analytics vs web analytics](/blog/product-analytics-vs-web-analytics) if you are not sure which camp you are in.

Privytics is in the product analytics camp. It is a good fit if you are migrating away from GA4's *event* usage. It is a poor fit if all you ever opened GA for was a traffic dashboard, and we would rather say that up front than sell you the wrong thing.

## Step 1: Pick the replacement tool

Before installing anything, write down the five to ten questions you actually answer with GA today. Not the reports you *have*, the ones you *use*. Something like "how many signups this week", "which channel drives paying users", "do people come back on day seven". That short list is your real spec, and it filters the market faster than any feature grid.

Then check the boring things that break migrations later:

- **Cookieless or not.** A [cookieless tool](/blog/what-is-cookieless-analytics) is what lets you drop the consent banner at the end. If a tool still sets a `_ga`-style cookie, you have swapped one banner for another.
- **Where data is hosted.** EU hosting is a large part of why people leave GA in the first place. If GDPR exposure is your reason for moving, hosting location is not a detail.
- **Event model.** Does the tool do custom events, funnels, retention, and cohorts, or only pageviews. Match this to your spec from above.
- **Pricing at your volume.** Cookieless and privacy-first tools charge by event volume, either metered or in stepped tiers, while a standard GA4 property carries no event-volume bill at all. What GA charges you instead is limits: as of July 2026 Google documents sampling in explorations above 10 million events per query, caps on things like custom dimensions and key events, and an upgrade path to the paid Analytics 360 for higher ceilings. Estimate your monthly events now so the bill is not a surprise in step six.

Pick one tool. Running a parallel migration against three candidates at once is how migrations stall. If you still need a shortlist, we keep one in [the best Google Analytics alternatives for 2026](/blog/best-google-analytics-alternatives-2026).

## Step 2: Install it alongside GA, and run in parallel

Do not remove the GA tag. Add the new tool's snippet next to it and let both collect data at the same time. Parallel running is the most important step in the whole process: it gives you a window where both tools see identical traffic, so you can build trust in the replacement before anything is at stake.

For a script-based install this is genuinely two tags in your `<head>`. For an SDK-based install you initialise the new client alongside GA in your app bootstrap. With Privytics you would use the OpenPanel web SDK pointed at the Privytics endpoints:

```html
<script>
  window.op = window.op || function (...args) { (window.op.q = window.op.q || []).push(args); };
  window.op('init', {
    clientId: 'YOUR_CLIENT_ID',
    apiUrl: 'https://YOUR_PRIVYTICS_HOST/api',
    trackScreenViews: true,
    trackOutgoingLinks: true,
  });
</script>
<script src="https://YOUR_PRIVYTICS_HOST/op1.js" defer></script>
```

The two things you must change are `apiUrl` and the script `src`, both pointed at your Privytics host, so events reach Privytics rather than the default OpenPanel cloud. Leave both tools running for at least two weeks. A single week is easily distorted by one campaign or one quiet holiday; two weeks smooths that out and gives you enough volume to compare shapes rather than single days. During this window, change nothing else about your tagging so the comparison stays clean.

## Step 3: Map your GA4 events and conversions to your new events

GA4 is event-based, so almost everything in it is already an event: `page_view`, `session_start`, `scroll`, plus whatever custom events you or a tag manager added. Your job is to decide which of those you actually care about and recreate them by name in the new tool.

Two things trip people up here. First, GA4 fires a pile of **automatic and enhanced-measurement events** you never asked for (scrolls, outbound clicks, file downloads, site search). You do not have to reproduce all of them. Port the events that answer questions on your spec, and let the rest go. Fewer, well-named events are easier to reason about, and on a tool priced by event volume they keep you in a cheaper tier for longer.

Second, **conversions**. GA4 now calls these **key events**, and Google's current documentation keeps the word "conversion" for the Google Ads side of the same action, so depending on when you last looked, your goals live under one label or the other. Either way, a key event in GA4 is just an event you flagged as important. In a product analytics tool the equivalent is usually the same named event used as the last step of a funnel or as a cohort trigger. Make a small table: GA event name on the left, your new event name and properties on the right. That table is your migration contract, and it is also your QA checklist for the next step.

Keep event names consistent and lowercase, and attach properties (plan, source, value) rather than baking values into the event name. `purchase` with a `plan` property beats `purchase_pro` and `purchase_team` as separate events.

## Step 4: Verify the numbers line up in shape, not to the decimal

Now compare the two tools over your parallel window. Here is the part every migration guide has to say plainly: **the numbers will not match, and that is normal.** If GA says 10,000 sessions and the new tool says 9,300, nothing is broken. You are looking for agreement in *shape and trend*, not identical totals.

They differ for real, boring reasons:

- **Ad blockers and consent.** A meaningful slice of visitors block Google Analytics specifically, or decline it in a consent banner. A privacy-first tool that is not served from Google's domains is blocked less often, so it frequently reports *more* traffic than GA, not less. If you want to narrow that gap further after the migration, [serving analytics through a first-party proxy](/blog/ad-blockers-analytics-first-party-proxy) is the next lever to pull.
- **Different definitions.** GA4's idea of a "session" (a window that ends after 30 minutes of inactivity by default, and adjustable per property in the data stream's tag settings) is not the same as another tool's. Sessions, users, and bounce are defined per tool.
- **Different identity models.** GA4 stitches identity with cookies and, where enabled, Google Signals. A cookieless tool identifies anonymous visitors differently. Privytics uses a salted hash of IP, user agent, and project id, with the salt rotating at midnight UTC and nothing stored on the device. That means a visitor who returns the next day counts as new unless they are logged in and identified, which keeps privacy strong but makes long-window unique counts read lower than GA's cookie-based ones.
- **What counts as an event.** GA4 counts pageviews and its automatic events toward its totals; your new tool counts only what you chose to send. So raw event counts are not comparable at all.

Practical test: pick three or four metrics from your spec, chart them side by side for the two weeks, and check that the lines rise and fall together. If a Tuesday spike shows up in both, and a slow weekend shows up in both, the tools agree and you can trust the replacement. If one tool shows a trend the other completely misses, you have a tagging bug to fix before cutting over.

## Step 5: Export your GA history before you cut over

On data portability the truth is blunt: **your GA history does not transfer cleanly into any new tool, and you should stop expecting it to.** The definitions differ, the identity model differs, and there is no clean import path that preserves GA's processed reports elsewhere. Anyone promising a lossless GA import is glossing over this.

So do not try to import history. Preserve it instead:

- **Export what the UI gives you.** In the GA4 interface you can export individual reports to CSV or Google Sheets. Grab the handful of reports you refer back to (channels, top pages, conversions by month). This is manual and limited, but it captures the summaries you actually cite.
- **Turn on BigQuery export for raw events** if you have not already. Analytics itself does not charge you to link a property to BigQuery, but two limits matter as of July 2026: Google documents a daily export cap of one million events for standard properties, and BigQuery's own storage and query costs are billed by Google Cloud beyond its free monthly allowance of 10 GB of storage and 1 TB of query processing. The export also only captures data *from the day you enable it forward*, not retroactively, so if there is any chance you will want raw historical events, switch it on early, ideally before you start the migration.
- **Keep GA read-only.** Event-level retention on a standard property is short: as of July 2026 Google offers 2 or 14 months, longer windows are an Analytics 360 feature, and properties that grow into Google's Large or XL categories are dropped back to 2 months automatically. The property itself stays accessible, though. Do not delete it. Leave it as a read-only archive you can open when someone asks "what did last year look like". It costs nothing to keep.

Treat the cutover as a clean line: GA holds the past, the new tool holds the future, and you do not pretend to merge them.

## Step 6: Remove GA and drop the cookie banner (if you can)

Once the parallel window has convinced you the new tool tells the same story, remove the GA tag and any GA-specific consent logic tied to it. Do this after a normal reporting cycle closes, not mid-month, so your last GA report is a clean period.

Then the payoff. If GA was the *only* thing on your site that required consent, and your replacement is genuinely cookieless, you can remove the cookie banner for anonymous visitors. With Privytics, the anonymous case sets no cookies and stores nothing on the device, so it does not need a consent banner on its own. Cross-session and cross-device tracking is opt-in through `identify()` with your own user id, which is a deliberate choice you make for logged-in users, not a default.

Two honest caveats before you delete the banner. First, this only holds if GA really was your last consent-requiring tracker. If you still run an ads pixel, a chat widget that sets cookies, or an A/B tool, those may keep the banner alive regardless. Second, "cookieless" is a strong argument for lawful processing, but it is not a lawyer. This is not legal advice, and whether you can drop the banner depends on your full stack and your jurisdiction, so read [is Google Analytics legal in the EU in 2026](/blog/is-google-analytics-legal-eu-2026) and, if you are unsure, ask your DPO or counsel. Removing a banner you were legally required to keep is worse than keeping one you did not need.

## When another tool is the better choice

Privytics is not the right migration target for everyone.

- **You want classic web analytics.** If GA was really a pageviews-and-traffic dashboard for you, a dedicated web analytics tool like Plausible, Fathom, or Umami is a closer, simpler swap. Privytics is product analytics; using it purely for pageviews is overkill.
- **You are very high volume and very cost-sensitive.** A standard GA4 property carries no event-volume bill, while above its free tier Privytics charges in stepped event-volume tiers. GA's limits bite in other ways, as covered above, but if you push tens of millions of events a month and privacy is not a driver, a zero invoice is hard to beat. Self-hosting the open-source OpenPanel engine is another route if you have the ops appetite.
- **You need a long operating track record.** Privytics is a newer service than privacy tools that have been running their hosted product for years. If a long reference list and a large support organisation are requirements, one of those is the safer pick, and we would rather you know that than find out later.
- **You depend on the Google ad ecosystem.** If your reporting is wired into Google Ads audiences and Signals, leaving GA4 breaks integrations that a privacy tool will not replace. Weigh that before you migrate.

## FAQ: migrating from GA4 to a cookieless tool

### Will my new tool's numbers match Google Analytics?

No, and they should not. Ad-block rates, session definitions, identity models, and what each tool counts as an event all differ. Aim for the two tools to move together in trend over your parallel window. Matching to the decimal is not a realistic or useful goal.

### Can I import my Google Analytics history into the new tool?

Not cleanly. There is no lossless path that preserves GA's processed reports in another tool. Export the reports you cite to CSV, enable BigQuery export for raw events going forward, and keep the GA property read-only as a historical archive. Treat the cutover as a clean line between past and future.

### How long should I run both tools in parallel?

At least two weeks. A single week can be skewed by one campaign or one quiet holiday; two weeks smooths that out and gives you enough volume to compare shapes rather than single noisy days. Change nothing else about your tagging during that window so the comparison stays clean.

### Do I really get to remove the cookie banner?

Only if GA was your last consent-requiring tracker and your replacement is genuinely cookieless. Privytics sets no cookies and stores nothing on the device for anonymous visitors, so it does not require a banner on its own. But an ads pixel or a cookie-setting chat widget can keep the banner alive, and the final call is legal, not technical, so check with your DPO or counsel.

### Is a cookieless tool actually more accurate?

It measures different things. Because it does not rely on Google's script or domains, it is blocked far less, so it often reports *more* anonymous traffic than GA. But cookieless identity resets for anonymous visitors (daily, in Privytics' case), so long-window unique-user counts read lower than GA's cookie-based ones. More total traffic, more conservative unique counts.

### What happens to my GA4 conversions and key events?

They map to named events in the new tool, usually as the last step of a funnel. What GA4 now calls a key event is just an event you flagged as important, and Google keeps the word "conversion" for the Google Ads side of it. Recreate it by name during the event-mapping step and use it as your funnel endpoint or cohort trigger.

## Trying Privytics

If your migration is really about GA4's *event* usage (funnels, retention, cohorts, per-user profiles) and you want it cookieless and EU-hosted, Privytics is built for exactly that path. It is a managed service built on the open-source OpenPanel engine (AGPL-3.0), with analytics data stored in Germany, cookieless tracking for the anonymous case, and opt-in `identify()` for logged-in users. Privytics is an independent European service, operated from Spain, and is not affiliated with, endorsed by, or sponsored by OpenPanel.

The free tier is 10,000 events per month for one project, with no credit card and 12-month retention, which is enough to run the whole parallel-migration exercise above without paying. Paid plans are stepped tiers by event volume (EUR 10 for 100k events, EUR 20 for 500k, EUR 40 for 1M, up to EUR 200 for 10M, ex VAT) and add session replay and five-year event history. Point the OpenPanel web SDK at your Privytics endpoints, run it next to GA for two weeks, and decide with real data in front of you. If it turns out you wanted web analytics or GA's free scale, this guide told you where those live instead.
