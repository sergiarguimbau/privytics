import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import type { ServiceDeps } from '../../services';
import {
  getCurrentSubscriptionProduct,
  isStaleSubscriptionEvent,
  resolveFreeDowngrade,
  resolvePeriodEventsLimit,
} from './subscription.service';

// test/preload.ts pins SELF_HOSTED=true, under which getSubscriptionState
// always answers 'self_hosted'; this file exercises the cloud states.
const preloadSelfHosted = process.env.SELF_HOSTED;
beforeAll(() => {
  process.env.SELF_HOSTED = 'false';
});
afterAll(() => {
  process.env.SELF_HOSTED = preloadSelfHosted;
});

const NOW = new Date('2026-11-16T12:00:00Z');
const PAST = new Date('2026-11-01T00:00:00Z');
const FUTURE = new Date('2026-12-01T00:00:00Z');
// Within the renewal grace window: Polar has not cycled the period yet.
const JUST_ENDED = new Date('2026-11-16T04:58:00Z');

describe('resolveFreeDowngrade (Privytics: free is the floor)', () => {
  it('canceled with no paid time left yields status free, limit 10000', () => {
    const result = resolveFreeDowngrade(
      {
        status: 'canceled',
        cancelAtPeriodEnd: false,
        currentPeriodEnd: FUTURE,
        canceledAt: PAST,
        pauseAtPeriodEnd: false,
      },
      'subscription.canceled',
      NOW
    );
    expect(result.isDowngradedToFree).toBe(true);
    expect(result.onFreeLimits).toBe(true);
  });

  it('cancel at period end keeps paid limits until the period ends', () => {
    const result = resolveFreeDowngrade(
      {
        status: 'canceled',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: FUTURE,
        canceledAt: PAST,
        pauseAtPeriodEnd: false,
      },
      'subscription.canceled',
      NOW
    );
    expect(result).toEqual({
      paidPeriodEndsAt: FUTURE,
      isDowngradedToFree: false,
      onFreeLimits: false,
    });
  });

  const active = {
    status: 'active' as const,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: FUTURE,
    canceledAt: null,
    pauseAtPeriodEnd: false,
  };

  it('revoked and unpaid drop to free; paused keeps its status on free limits', () => {
    expect(
      resolveFreeDowngrade(active, 'subscription.revoked', NOW)
        .isDowngradedToFree
    ).toBe(true);
    expect(
      resolveFreeDowngrade(
        { ...active, status: 'unpaid' },
        'subscription.updated',
        NOW
      ).isDowngradedToFree
    ).toBe(true);
    const paused = resolveFreeDowngrade(
      { ...active, status: 'paused' },
      'subscription.updated',
      NOW
    );
    expect(paused.isDowngradedToFree).toBe(false);
    expect(paused.onFreeLimits).toBe(true);
    expect(
      resolveFreeDowngrade(active, 'subscription.updated', NOW).onFreeLimits
    ).toBe(false);
  });

  it('whatever the state machine reads as free is downgraded', () => {
    // A checkout whose first payment never succeeded.
    expect(
      resolveFreeDowngrade(
        { ...active, status: 'incomplete_expired', currentPeriodEnd: PAST },
        'subscription.updated',
        NOW
      ).isDowngradedToFree
    ).toBe(true);
  });

  it('an active snapshot the clock reads as over is held to free limits but never stored as free', () => {
    // A delayed retry of a cancel-at-period-end event, after the period.
    expect(
      resolveFreeDowngrade(
        {
          ...active,
          cancelAtPeriodEnd: true,
          canceledAt: PAST,
          currentPeriodEnd: JUST_ENDED,
        },
        'subscription.canceled',
        NOW
      )
    ).toEqual({
      paidPeriodEndsAt: JUST_ENDED,
      isDowngradedToFree: false,
      onFreeLimits: true,
    });
    // A renewing period that ended 4 days ago (late redelivery, renewal
    // event not landed yet): past the grace window, still not a downgrade.
    const fourDaysAgo = new Date('2026-11-12T12:00:00Z');
    expect(
      resolveFreeDowngrade(
        { ...active, currentPeriodEnd: fourDaysAgo },
        'subscription.updated',
        NOW
      )
    ).toEqual({
      paidPeriodEndsAt: fourDaysAgo,
      isDowngradedToFree: false,
      onFreeLimits: true,
    });
  });

  it('a renewing period that just ended is not a downgrade (renewal pending)', () => {
    const result = resolveFreeDowngrade(
      { ...active, currentPeriodEnd: JUST_ENDED },
      'subscription.updated',
      NOW
    );
    expect(result.isDowngradedToFree).toBe(false);
    expect(result.onFreeLimits).toBe(false);
  });
});

describe('resolvePeriodEventsLimit', () => {
  const limits = { product: 1_000_000, current: 10_000 };

  it('paid gets the product limit, free limits the free allowance', () => {
    expect(resolvePeriodEventsLimit('active', false, limits)).toBe(1_000_000);
    expect(resolvePeriodEventsLimit('canceled', true, limits)).toBe(10_000);
    expect(
      resolvePeriodEventsLimit('canceled', true, { ...limits, current: 0 })
    ).toBe(10_000);
  });

  it('a checkout that was never paid grants nothing', () => {
    expect(resolvePeriodEventsLimit('incomplete', false, limits)).toBe(10_000);
    expect(
      resolvePeriodEventsLimit('incomplete', false, { ...limits, current: 0 })
    ).toBe(0);
    expect(resolvePeriodEventsLimit('incomplete_expired', true, limits)).toBe(
      10_000
    );
    // A later org (no free allowance) does not gain one by an expired checkout.
    expect(
      resolvePeriodEventsLimit('incomplete_expired', true, {
        ...limits,
        current: 0,
      })
    ).toBe(0);
  });
});

describe('isStaleSubscriptionEvent', () => {
  const stored = {
    subscriptionId: 'sub_1',
    subscriptionStatus: 'active',
    subscriptionStartsAt: PAST,
  };
  const event: Parameters<typeof isStaleSubscriptionEvent>[1] = {
    id: 'sub_1',
    currentPeriodStart: PAST,
    status: 'active',
  };
  const paid = { isDowngradedToFree: false, onFreeLimits: false };
  const ended = { isDowngradedToFree: true, onFreeLimits: true };

  it('an event for an earlier billing period is stale', () => {
    expect(
      isStaleSubscriptionEvent(
        stored,
        { ...event, currentPeriodStart: new Date('2026-10-01T00:00:00Z') },
        paid
      )
    ).toBe(true);
    expect(isStaleSubscriptionEvent(stored, event, paid)).toBe(false);
  });

  it('a retry after we moved the subscription to free cannot bring paid state back', () => {
    const downgraded = { ...stored, subscriptionStatus: 'free' };
    expect(isStaleSubscriptionEvent(downgraded, event, paid)).toBe(true);
    // A stale active+canceledAt retry: free limits, but not a downgrade.
    expect(
      isStaleSubscriptionEvent(downgraded, event, {
        isDowngradedToFree: false,
        onFreeLimits: true,
      })
    ).toBe(true);
    // Another terminal event for it still applies.
    expect(isStaleSubscriptionEvent(downgraded, event, ended)).toBe(false);
    // A new billing period (late renewal) does.
    expect(
      isStaleSubscriptionEvent(
        downgraded,
        { ...event, currentPeriodStart: FUTURE },
        paid
      )
    ).toBe(false);
    // A different (new) subscription that is live applies.
    expect(
      isStaleSubscriptionEvent(downgraded, { ...event, id: 'sub_2' }, paid)
    ).toBe(false);
  });

  it('an event ending a subscription that is not the current one never downgrades the org', () => {
    // Org pays on sub_C; an old sub_B is revoked/unpaid or its abandoned
    // checkout expires.
    const onC = { ...stored, subscriptionId: 'sub_C' };
    const forB = { ...event, id: 'sub_B' };
    expect(
      isStaleSubscriptionEvent(onC, { ...forB, status: 'unpaid' }, ended)
    ).toBe(true);
    expect(
      isStaleSubscriptionEvent(
        onC,
        { ...forB, status: 'incomplete_expired' },
        ended
      )
    ).toBe(true);
    // A stale active+canceledAt retry of the old one.
    expect(
      isStaleSubscriptionEvent(onC, forB, {
        isDowngradedToFree: false,
        onFreeLimits: true,
      })
    ).toBe(true);
    // Canceled with paid time left (cancel at period end) is ignored too.
    expect(
      isStaleSubscriptionEvent(onC, { ...forB, status: 'canceled' }, paid)
    ).toBe(true);
    // A non-ending event for a new id still applies (new subscription).
    expect(isStaleSubscriptionEvent(onC, forB, paid)).toBe(false);
    expect(
      isStaleSubscriptionEvent(
        { ...stored, subscriptionId: null, subscriptionStartsAt: null },
        forB,
        paid
      )
    ).toBe(false);
  });
});

describe('getCurrentSubscriptionProduct', () => {
  const depsFor = (organization: Record<string, unknown>) =>
    ({
      db: { organization: { findUniqueOrThrow: async () => organization } },
    }) as unknown as ServiceDeps;

  it('an org that dropped to free has no current product', async () => {
    expect(
      await getCurrentSubscriptionProduct(
        depsFor({ hasSubscription: false, subscriptionProductId: 'prod_1m' }),
        'org-1'
      )
    ).toBeNull();
  });

  it('a plan set up by hand (active, no product) has none either', async () => {
    expect(
      await getCurrentSubscriptionProduct(
        depsFor({ hasSubscription: true, subscriptionProductId: null }),
        'privytics'
      )
    ).toBeNull();
  });
});
