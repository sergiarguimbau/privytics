import type { SubscriptionState } from '@openpanel/payments/subscription-state';
import { describe, expect, it } from 'vitest';
import {
  canUseAssistant,
  hasNoAllowance,
  isOnFreeLimits,
  planBadgeLabel,
} from './plan-state';

const org = (
  subscriptionState: SubscriptionState,
  subscriptionPeriodEventsLimit = 10_000
) => ({ subscriptionState, subscriptionPeriodEventsLimit });

describe('plan state', () => {
  it('holds free and paused orgs to the free limits, not their old product', () => {
    expect(isOnFreeLimits(org('free'))).toBe(true);
    expect(isOnFreeLimits(org('paused'))).toBe(true);
    // An unpaid checkout is hard-capped at ingest like free.
    expect(isOnFreeLimits(org('incomplete', 1_000_000))).toBe(true);
    expect(isOnFreeLimits(org('active', 1_000_000))).toBe(false);
    expect(isOnFreeLimits(org('pausing', 1_000_000))).toBe(false);
  });

  it('flags only a free org with no allowance as needing a plan', () => {
    expect(hasNoAllowance(org('free', 0))).toBe(true);
    expect(hasNoAllowance(org('free'))).toBe(false);
    expect(hasNoAllowance(org('active', 0))).toBe(false);
    // A later org mid-checkout still has nothing to collect events with.
    expect(hasNoAllowance(org('incomplete', 0))).toBe(true);
    expect(hasNoAllowance(org('incomplete'))).toBe(false);
  });

  it('keeps the assistant for paying orgs only', () => {
    expect(canUseAssistant('free')).toBe(false);
    expect(canUseAssistant('paused')).toBe(false);
    expect(canUseAssistant('incomplete')).toBe(false);
    expect(canUseAssistant('active')).toBe(true);
    expect(canUseAssistant('canceling')).toBe(true);
  });

  it('labels a comped org a custom plan, never the free plan', () => {
    expect(planBadgeLabel(org('active', 10_000_000))).toBe('Custom plan');
    expect(planBadgeLabel(org('free'))).toBe('Free plan');
    expect(planBadgeLabel(org('free', 0))).toBe('No plan');
    expect(planBadgeLabel(org('paused'))).toBe('Paused');
    expect(planBadgeLabel(org('incomplete'))).toBe('Free plan');
    expect(planBadgeLabel(org('incomplete', 0))).toBe('No plan');
  });
});
