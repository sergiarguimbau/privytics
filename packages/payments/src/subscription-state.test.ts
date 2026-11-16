import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getSubscriptionChartEndDate,
  getSubscriptionState,
  RENEWAL_GRACE_MS,
  type SubscriptionState,
  subscriptionBlocksDashboard,
} from './subscription-state.js';

const DAY = 1000 * 60 * 60 * 24;
const future = new Date(Date.now() + 30 * DAY);
const past = new Date(Date.now() - DAY);
const lapsed = new Date(Date.now() - RENEWAL_GRACE_MS - DAY);

type Case = {
  name: string;
  status: string | null;
  canceledAt: Date | null;
  endsAt: Date | null;
  pauseAtPeriodEnd?: boolean;
  expected: SubscriptionState;
};

describe('getSubscriptionState', () => {
  const original = process.env.SELF_HOSTED;
  // The function short-circuits when SELF_HOSTED==='true'; force it off so we
  // exercise the real billing logic regardless of the dev's local env.
  beforeEach(() => {
    delete process.env.SELF_HOSTED;
  });
  afterEach(() => {
    if (original === undefined) {
      delete process.env.SELF_HOSTED;
    } else {
      process.env.SELF_HOSTED = original;
    }
  });

  const cases: Case[] = [
    // No paid subscription at all -> the permanent free tier, never a lockout.
    { name: 'null status', status: null, canceledAt: null, endsAt: null, expected: 'free' },
    { name: 'null status with a stale end date', status: null, canceledAt: null, endsAt: past, expected: 'free' },

    // Privytics permanent free tier — never expires, never blocks.
    { name: 'free status, no end date', status: 'free', canceledAt: null, endsAt: null, expected: 'free' },
    { name: 'free status ignores end date', status: 'free', canceledAt: null, endsAt: past, expected: 'free' },

    // Active paid subscription.
    { name: 'active, renewing', status: 'active', canceledAt: null, endsAt: future, expected: 'active' },
    { name: 'active, no end date', status: 'active', canceledAt: null, endsAt: null, expected: 'active' },
    // The renewal webhook always lands after the period end, sometimes hours
    // later: a paying org must not read as free (retention, hard cap) meanwhile.
    { name: 'active, period just ended, renewal webhook pending', status: 'active', canceledAt: null, endsAt: past, expected: 'active' },
    { name: 'active but period lapsed past the grace window drops to free', status: 'active', canceledAt: null, endsAt: lapsed, expected: 'free' },

    // Cancel-at-period-end keeps status active while canceledAt is set. Paid
    // time already bought is honoured, then the org falls back to free.
    { name: 'active + canceledAt, period remaining', status: 'active', canceledAt: past, endsAt: future, expected: 'canceling' },
    { name: 'active + canceledAt, period over', status: 'active', canceledAt: past, endsAt: past, expected: 'free' },

    // Polar also reports `canceled` for "cancels at period end".
    { name: 'canceled with paid time left', status: 'canceled', canceledAt: past, endsAt: future, expected: 'canceling' },
    { name: 'canceled, period over', status: 'canceled', canceledAt: past, endsAt: past, expected: 'free' },
    { name: 'canceled, no end date', status: 'canceled', canceledAt: past, endsAt: null, expected: 'free' },

    // Pause-at-period-end keeps status active while the flag is set. Paused is
    // non-blocking: billing stopped, free-tier limits until it resumes.
    { name: 'active + pause scheduled', status: 'active', canceledAt: null, endsAt: future, pauseAtPeriodEnd: true, expected: 'pausing' },
    { name: 'cancel wins over scheduled pause', status: 'active', canceledAt: past, endsAt: future, pauseAtPeriodEnd: true, expected: 'canceling' },
    { name: 'pause scheduled, period already ended', status: 'active', canceledAt: null, endsAt: past, pauseAtPeriodEnd: true, expected: 'paused' },
    { name: 'pause scheduled, no end date', status: 'active', canceledAt: null, endsAt: null, pauseAtPeriodEnd: true, expected: 'paused' },
    { name: 'paused', status: 'paused', canceledAt: null, endsAt: past, expected: 'paused' },

    // Payment-problem states.
    { name: 'past_due keeps paid access', status: 'past_due', canceledAt: null, endsAt: future, expected: 'past_due' },
    { name: 'incomplete', status: 'incomplete', canceledAt: null, endsAt: future, expected: 'incomplete' },

    // Terminal payment failures fall back to the free floor rather than a lockout.
    { name: 'unpaid drops to free', status: 'unpaid', canceledAt: null, endsAt: future, expected: 'free' },
    { name: 'incomplete_expired drops to free', status: 'incomplete_expired', canceledAt: null, endsAt: past, expected: 'free' },

    // Retired trial statuses can still exist on legacy rows.
    { name: 'legacy trialing row', status: 'trialing', canceledAt: null, endsAt: future, expected: 'free' },
    { name: 'legacy trialing row, ended', status: 'trialing', canceledAt: null, endsAt: past, expected: 'free' },
    { name: 'legacy trial_expired row', status: 'trial_expired', canceledAt: null, endsAt: past, expected: 'free' },

    // Unknown status is never silently "active"; it lands on free.
    { name: 'unknown status', status: 'something_new', canceledAt: null, endsAt: future, expected: 'free' },
  ];

  for (const c of cases) {
    it(`${c.name} -> ${c.expected}`, () => {
      expect(
        getSubscriptionState({
          subscriptionStatus: c.status,
          subscriptionCanceledAt: c.canceledAt,
          subscriptionEndsAt: c.endsAt,
          subscriptionPauseAtPeriodEnd: c.pauseAtPeriodEnd ?? false,
        })
      ).toBe(c.expected);
    });
  }

  it('SELF_HOSTED=true or 1 short-circuits to self_hosted', () => {
    for (const value of ['true', '1']) {
      process.env.SELF_HOSTED = value;
      expect(
        getSubscriptionState({
          subscriptionStatus: null,
          subscriptionCanceledAt: past,
          subscriptionEndsAt: past,
          subscriptionPauseAtPeriodEnd: false,
        })
      ).toBe('self_hosted');
    }
  });

  it('a renewing period lapses exactly when the grace window closes', () => {
    const endsAt = new Date('2027-03-14T04:58:00Z');
    const org = {
      subscriptionStatus: 'active',
      subscriptionCanceledAt: null,
      subscriptionEndsAt: endsAt,
      subscriptionPauseAtPeriodEnd: false,
    };
    const graceEnd = endsAt.getTime() + RENEWAL_GRACE_MS;
    expect(getSubscriptionState(org, new Date(graceEnd - 1))).toBe('active');
    expect(getSubscriptionState(org, new Date(graceEnd))).toBe('free');
  });
});

describe('getSubscriptionChartEndDate', () => {
  const original = process.env.SELF_HOSTED;
  beforeEach(() => {
    delete process.env.SELF_HOSTED;
  });
  afterEach(() => {
    if (original === undefined) {
      delete process.env.SELF_HOSTED;
    } else {
      process.env.SELF_HOSTED = original;
    }
  });

  const NOW = new Date('2026-11-16T12:00:00Z');
  const TOMORROW = new Date(NOW.getTime() + DAY);
  const PAUSE_DATE = new Date('2026-10-01T00:00:00Z');
  const EXCEEDED = new Date('2026-11-10T00:00:00Z');
  const chartEnd = (org: {
    subscriptionStatus: string | null;
    subscriptionEndsAt: Date | null;
    subscriptionPeriodEventsCountExceededAt: Date | null;
    subscriptionCanceledAt?: Date | null;
  }) =>
    getSubscriptionChartEndDate(
      {
        subscriptionCanceledAt: null,
        subscriptionPauseAtPeriodEnd: false,
        ...org,
      },
      NOW
    );

  it('never stops at a past end date (paused, dropped to free)', () => {
    for (const subscriptionStatus of ['paused', 'free', 'canceled']) {
      expect(
        chartEnd({
          subscriptionStatus,
          subscriptionEndsAt: PAUSE_DATE,
          subscriptionPeriodEventsCountExceededAt: null,
        })
      ).toEqual(TOMORROW);
    }
  });

  it('keeps the soft cap for a paid period over its limit', () => {
    expect(
      chartEnd({
        subscriptionStatus: 'active',
        subscriptionEndsAt: new Date('2026-12-01T00:00:00Z'),
        subscriptionPeriodEventsCountExceededAt: EXCEEDED,
      })
    ).toEqual(EXCEEDED);
  });

  it('ignores the exceeded flag on free limits and on a plan with no Polar period', () => {
    expect(
      chartEnd({
        subscriptionStatus: 'free',
        subscriptionEndsAt: null,
        subscriptionPeriodEventsCountExceededAt: EXCEEDED,
      })
    ).toEqual(TOMORROW);
    expect(
      chartEnd({
        subscriptionStatus: 'paused',
        subscriptionEndsAt: PAUSE_DATE,
        subscriptionPeriodEventsCountExceededAt: EXCEEDED,
      })
    ).toEqual(TOMORROW);
    // An unpaid checkout: nothing paid yet, hard-capped like free.
    expect(
      chartEnd({
        subscriptionStatus: 'incomplete',
        subscriptionEndsAt: new Date('2026-12-01T00:00:00Z'),
        subscriptionPeriodEventsCountExceededAt: EXCEEDED,
      })
    ).toEqual(TOMORROW);
    // The comped org: active, no Polar dates.
    expect(
      chartEnd({
        subscriptionStatus: 'active',
        subscriptionEndsAt: null,
        subscriptionPeriodEventsCountExceededAt: EXCEEDED,
      })
    ).toEqual(TOMORROW);
  });

  it('SELF_HOSTED has no limit', () => {
    process.env.SELF_HOSTED = 'true';
    expect(
      chartEnd({
        subscriptionStatus: 'active',
        subscriptionEndsAt: PAUSE_DATE,
        subscriptionPeriodEventsCountExceededAt: EXCEEDED,
      })
    ).toBeNull();
  });
});

describe('subscriptionBlocksDashboard', () => {
  // The free tier is the floor, so billing state never locks anyone out.
  const everyState: SubscriptionState[] = [
    'self_hosted',
    'free',
    'active',
    'canceling',
    'pausing',
    'paused',
    'past_due',
    'incomplete',
  ];

  for (const state of everyState) {
    it(`never blocks ${state}`, () => {
      expect(subscriptionBlocksDashboard(state)).toBe(false);
    });
  }
});
