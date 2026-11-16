# Privytics billing (Polar)

Privytics runs in CLOUD mode (`SELF_HOSTED` unset), so billing and per-org
event metering are active. Billing is Polar, a merchant of record that collects
and remits EU VAT for us.

## The model: free <-> paid, no trial

There is **no trial**. The free tier is the floor and an organization is never
locked out of the dashboard; a paid plan that ends simply drops back to free.

| Events / month | Price | How |
| --- | --- | --- |
| 10,000 | €0 | Permanent free tier (`free` subscription state) |
| 100,000 | €10 | Polar product |
| 500,000 | €20 | Polar product |
| 1,000,000 | €40 | Polar product (popular) |
| 5,000,000 | €100 | Polar product |
| 10,000,000 | €200 | Polar product |
| more than 10M | Custom | not self-serve |

No per-event / usage billing. Predictable stepped tiers are the wedge; do not
switch to metered pricing.

## Implemented

- **Subscription states** (`src/subscription-state.ts`): `self_hosted`, `free`,
  `active`, `canceling`, `pausing`, `paused`, `past_due`, `incomplete`. A
  `paused` organization is held to the free tier's limits until it resumes.
  Every terminal Polar status
  (canceled, revoked, unpaid, incomplete_expired) resolves to `free`. Polar
  reports `canceled` for cancel-at-period-end too, so paid time already bought
  is honoured as `canceling` until the period actually ends. A renewing
  `active` subscription gets a 3-day grace window (`RENEWAL_GRACE_MS`) after
  `subscriptionEndsAt` before it resolves to `free`, because the renewal
  webhook always lands after the period end and can be late. Canceling and
  canceled subscriptions get no grace: no renewal is coming.
- **Nothing blocks the dashboard.** `subscriptionBlocksDashboard()` always
  returns false. Upstream's `FREE_PRODUCT_IDS` gate was removed with it.
- **New organizations** start on `free` with `FREE_TIER_EVENTS_LIMIT` (10,000)
  and no end date, for the user's first organization only; later ones get 0
  (`packages/core/src/modules/onboarding/onboarding.service.ts`).
- **Downgrade to free on cancellation**: the Polar webhook
  (`POST /webhook/polar`, `syncSubscriptionToOrg` in
  `packages/core/src/modules/subscription/subscription.service.ts`) resets the
  org to the `free` status and the free allowance once a subscription is
  genuinely over (revoked, unpaid, or canceled with no paid time left), instead
  of leaving it on a paid limit it no longer pays for. The downgrade is derived
  from `getSubscriptionState` on the incoming event: anything it reads as
  `free` with a status that is no longer `active`, plus `subscription.revoked`
  (an `active` snapshot the clock reads as over keeps its row on free limits).
  An event that ends a subscription other than the org's current one is
  ignored. A downgrade writes status `free`, a null
  end date, and nulls `subscriptionProductId` and `subscriptionPriceId` (the
  subscription id is kept). A `paused` subscription keeps its status but gets
  the free allowance. `incomplete` keeps the org's current limit (nothing paid
  yet), and `incomplete_expired` gets min(current, 10,000), so a later org with
  no allowance does not gain one from an unpaid checkout. A retry for a
  subscription already moved to free is ignored unless it starts a new billing
  period, so a delayed event cannot bring paid state back.
- **Free-tier metering**: free and paused orgs are metered by
  `getOrganizationBillingEventsCount` against the **calendar month in UTC**,
  resetting on the 1st, even when old Polar period columns are still set.
  They count by ingestion time (`inserted_at`), not event time, so events
  back-dated into an earlier month still count toward this month's cap.
  `session/src/usage.ts` treats an exceeded flag or usage-alert marker from an
  earlier month as unset for them, since no webhook resets it.
- **Hard cap at ingestion** (`isFreeTierBlocked` in
  `packages/core/src/modules/ingest/ingest.service.ts`, wired in
  `ingest.routes.ts` on `POST /track` and `POST /event`): a free or paused org
  with no allowance, or flagged over its allowance this month, gets
  **202 `{ blocked: true, reason: "free_limit" }`** and the event is dropped.
  202 rather than 402: the SDKs retry every non-2xx except 401. The flag lags
  by up to an hour (it refreshes when a session ends) plus the 5 minute org
  cache, so a free org can overshoot slightly. Paid plans stay soft-capped so a
  spike never loses data.
- **Session replay is paid-only**: replay events from a free or paused org get
  **202 `{ blocked: true, reason: "replay_paid_only" }`** on the same path.
- **Retention** (`runDataRetentionCron` in
  `packages/core/src/modules/organization/organization.service.ts`, daily
  `dataRetention` cron at 05:00 UTC): free keeps 12 months, every other state
  5 years, matching the Terms and Privacy Policy. It deletes `events`,
  `sessions` and `session_replay_chunks` rows older than the cutoff.

## Remaining, needs the Polar sandbox / credentials

1. Create a Polar organization; get `POLAR_ACCESS_TOKEN` and the webhook secret.
2. Run `scripts/create-products.ts` to create the paid products from `PRICING`
   (each carries `eventsLimit` metadata used for metering).
3. Run `scripts/sync-subscriptions.ts` to backfill subscription state, with
   `--dry` first and review the planned changes. It applies the webhook's
   rules: a subscription the state machine reads as over drops the org to
   `free` (only for a status that is no longer `active`; an `active` one keeps
   its row on free limits), `paused` gets the free allowance, `incomplete`
   keeps the current limit and `incomplete_expired` never lifts it above the
   free allowance. It skips an ended or canceled subscription that is not the
   org's current one, and never touches `privytics` (comped) or
   `openpanel-dev`. The logic is duplicated from core's
   `resolveFreeDowngrade`, `resolvePeriodEventsLimit` and
   `isStaleSubscriptionEvent` (`subscription.service.ts`), not imported: keep
   the two in sync when either changes.
4. Point the Polar webhook at `https://api.privytics.com/webhook/polar` and set
   `POLAR_WEBHOOK_SECRET` on the api.
5. End-to-end verify the downgrade path against the sandbox: subscribe, cancel,
   confirm the org lands on `free` with the 10k allowance at period end.

## Not yet implemented

- **Anti-abuse limits** on free signups, beyond the existing rate limiting and
  Cloudflare Turnstile.
