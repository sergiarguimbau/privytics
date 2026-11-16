import { isChatBlockedState } from '@openpanel/core/modules/assistant/assistant.constants';
import type { SubscriptionState } from '@openpanel/payments/subscription-state';

interface PlanStateInput {
  subscriptionState: SubscriptionState;
  subscriptionPeriodEventsLimit: number;
}

/**
 * Free, paused and unpaid-checkout (incomplete) orgs are hard-capped at
 * ingestion like the free plan, whatever product their subscription names.
 */
export const isOnFreeLimits = ({ subscriptionState }: PlanStateInput) =>
  subscriptionState === 'free' ||
  subscriptionState === 'paused' ||
  subscriptionState === 'incomplete';

/** Free events cover a user's first org only, so a later free org rejects every event until it has a plan (an unpaid checkout grants none). */
export const hasNoAllowance = (org: PlanStateInput) =>
  (org.subscriptionState === 'free' ||
    org.subscriptionState === 'incomplete') &&
  org.subscriptionPeriodEventsLimit <= 0;

// The same list the server's AI gate uses: the assistant is paid-only.
export const canUseAssistant = (state: SubscriptionState) =>
  !isChatBlockedState(state);

/** Badge for an org with no paid product to manage. 'active' without one is a plan set up by hand. */
export function planBadgeLabel(org: PlanStateInput): string {
  if (hasNoAllowance(org)) {
    return 'No plan';
  }
  switch (org.subscriptionState) {
    // An unpaid checkout keeps the free allowance until it is paid.
    case 'free':
    case 'incomplete':
      return 'Free plan';
    case 'paused':
      return 'Paused';
    case 'active':
    case 'self_hosted':
      return 'Custom plan';
    default:
      return 'No plan';
  }
}
