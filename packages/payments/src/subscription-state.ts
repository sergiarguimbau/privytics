/**
 * Canonical subscription state for an organization. This is the single place
 * the raw Polar status + cancellation/period fields are interpreted; every
 * boolean flag and UI surface derives from it.
 *
 * Privytics has a permanent free tier, so the model is simply free <-> paid:
 * the free plan is the *floor*, never a lockout. A paid subscription that ends
 * for any reason (canceled, revoked, terminally unpaid, or lapsed) falls back
 * to `free` rather than to a blocking state. There is no trial.
 *
 * Pause (upstream's save flow) is kept as two non-blocking states: `pausing`
 * is still paid until the period ends; `paused` means billing has stopped, so
 * the organization is held to the free tier's limits until it resumes.
 *
 * Pure, dependency-free domain logic so both the database layer (Prisma
 * computed fields) and the browser dashboard can consume it without coupling
 * to either side.
 */
export type SubscriptionState =
  | 'self_hosted' // SELF_HOSTED=true — billing not applicable
  | 'free' // permanent free tier: full access, event-capped, never expires
  | 'active' // paid, renewing
  | 'canceling' // paid, scheduled to cancel at period end
  | 'pausing' // paid, scheduled to pause at period end
  | 'paused' // billing stopped; free-tier limits until resumed, never blocks
  | 'past_due' // payment failed, in dunning (keeps paid access)
  | 'incomplete'; // initial checkout not completed

export interface SubscriptionStateInput {
  subscriptionStatus: string | null;
  subscriptionCanceledAt: Date | null;
  subscriptionEndsAt: Date | null;
  subscriptionPauseAtPeriodEnd: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How long a renewing subscription stays paid after its stored period end.
 * The end date only moves when Polar's renewal webhook lands, which is always
 * after the period end and can be hours late (delivery retries, our own
 * deploys). Without this window a paying organization would read as free in
 * that gap: 12-month retention, the free hard cap, no replay.
 */
export const RENEWAL_GRACE_MS = 3 * DAY_MS;

/** `SELF_HOSTED` is on for `true` or `1`, the same rule as the api's config. */
export function isSelfHostedEnv(): boolean {
  const value = process.env.SELF_HOSTED;
  return value === 'true' || value === '1';
}

export function getSubscriptionState(
  org: SubscriptionStateInput,
  now: Date = new Date()
): SubscriptionState {
  if (isSelfHostedEnv()) {
    return 'self_hosted';
  }

  const {
    subscriptionStatus,
    subscriptionCanceledAt,
    subscriptionEndsAt,
    subscriptionPauseAtPeriodEnd,
  } = org;

  switch (subscriptionStatus) {
    case 'active': {
      // Cancel-at-period-end keeps the Polar status as `active` while
      // `canceledAt` is set, and the subscription stays usable until it ends.
      // No renewal is coming, so no grace. Cancellation wins over a scheduled
      // pause.
      const hasEnded = Boolean(subscriptionEndsAt && subscriptionEndsAt <= now);
      if (subscriptionCanceledAt) {
        return hasEnded ? 'free' : 'canceling';
      }
      // Pause-at-period-end keeps the status `active` with the flag set until
      // the period ends, then Polar flips it to `paused`. Without a future end
      // date the paid period is over, so fail safe to `paused`.
      if (subscriptionPauseAtPeriodEnd) {
        const endsInFuture = Boolean(
          subscriptionEndsAt && subscriptionEndsAt > now
        );
        return endsInFuture ? 'pausing' : 'paused';
      }
      // A renewing period that lapsed past the grace window (missed webhook)
      // drops the organization to the free tier.
      const hasLapsed = Boolean(
        subscriptionEndsAt &&
          subscriptionEndsAt.getTime() + RENEWAL_GRACE_MS <= now.getTime()
      );
      return hasLapsed ? 'free' : 'active';
    }
    case 'canceled': {
      // Polar reports `canceled` both for "cancels at period end" and for an
      // immediate revocation. Paid time already bought is honoured: the
      // organization only drops to free once the period is actually over.
      const hasPaidTimeLeft = Boolean(
        subscriptionEndsAt && subscriptionEndsAt > now
      );
      return hasPaidTimeLeft ? 'canceling' : 'free';
    }
    case 'paused':
      return 'paused';
    case 'past_due':
      return 'past_due';
    case 'incomplete':
      return 'incomplete';
    default:
      // `free`, null, and every terminal Polar status (canceled, revoked,
      // unpaid, incomplete_expired) resolve to the permanent free tier, as do
      // the retired `trialing` / `trial_expired` statuses on legacy rows.
      return 'free';
  }
}

/**
 * Privytics never blocks the dashboard on billing state. The free tier is the
 * floor, so an organization always keeps access, capped at the free event
 * limit. Kept as an explicit, single place for callers to ask rather than
 * scattering the assumption across routes.
 */
export function subscriptionBlocksDashboard(
  _state: SubscriptionState
): boolean {
  return false;
}

/**
 * The latest moment charts may show, or null for no limit. Never a date the
 * subscription ended: dashboard access does not expire. Only upstream's soft
 * cap stays, for an org on a Polar billing period: once a paid period went
 * over its limit, charts stop there until the next period or a bigger plan
 * clears the flag. Free, paused and incomplete (nothing paid yet) orgs are
 * hard-capped at ingestion instead,
 * and their flag is a calendar-month marker that can be stale, so they never
 * clamp.
 */
export function getSubscriptionChartEndDate(
  org: SubscriptionStateInput & {
    subscriptionPeriodEventsCountExceededAt: Date | null;
  },
  now: Date = new Date()
): Date | null {
  const state = getSubscriptionState(org, now);
  if (state === 'self_hosted') {
    return null;
  }
  const isPaidPeriodOverLimit =
    state !== 'free' &&
    state !== 'paused' &&
    state !== 'incomplete' &&
    org.subscriptionEndsAt !== null &&
    org.subscriptionPeriodEventsCountExceededAt !== null;
  if (isPaidPeriodOverLimit) {
    return org.subscriptionPeriodEventsCountExceededAt;
  }
  return new Date(now.getTime() + DAY_MS);
}
