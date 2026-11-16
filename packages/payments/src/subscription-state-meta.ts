import { format } from 'date-fns';
import type { SubscriptionState } from './subscription-state.js';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive';
type Tone = 'default' | 'warning' | 'destructive';

export type SubscriptionStateMeta = {
  /** Sidebar badge, or null when nothing should be shown. */
  badge: { label: string; variant: BadgeVariant } | null;
  /** App-level banner, or null when no banner should show for this state. */
  banner: {
    title: string;
    description: string;
    cta: string;
    tone: Tone;
  } | null;
  /** Inline status line on the billing page, or null. */
  statusLine: { text: string; tone: Tone } | null;
};

const fmt = (date: Date | null | undefined) =>
  date ? format(date, 'PPP') : null;

/**
 * Single source of truth for how every subscription state is presented across
 * the dashboard (billing page status line, app banner, sidebar badge). All
 * lifecycle dates come from `subscriptionEndsAt`.
 *
 * Privytics has no trial and never blocks the dashboard: a paid plan that ends
 * drops the organization to the permanent free tier, so the copy here talks
 * about moving to the free plan rather than losing access.
 */
export function getSubscriptionStateMeta(
  state: SubscriptionState,
  opts: {
    endsAt?: Date | null;
    canceledAt?: Date | null;
    resumesAt?: Date | null;
  }
): SubscriptionStateMeta {
  const endsAt = fmt(opts.endsAt);
  const resumesAt = fmt(opts.resumesAt);

  switch (state) {
    case 'self_hosted':
    case 'active':
      return {
        badge: null,
        banner: null,
        statusLine: endsAt
          ? { text: `Your subscription renews on ${endsAt}`, tone: 'default' }
          : null,
      };

    case 'free':
      return {
        badge: { label: 'Free', variant: 'secondary' },
        banner: null,
        statusLine: {
          text: 'You are on the free plan. Upgrade any time to raise your limit and unlock session replay.',
          tone: 'default',
        },
      };

    case 'canceling':
      return {
        badge: { label: 'Canceling', variant: 'warning' },
        banner: {
          title: 'Subscription will be canceled',
          description: endsAt
            ? `You have canceled your subscription. On ${endsAt} your organization moves to the free plan. Reactivate to keep your current limits.`
            : 'You have canceled your subscription. Your organization will move to the free plan at the end of the period. Reactivate to keep your current limits.',
          cta: 'Reactivate',
          tone: 'warning',
        },
        statusLine: endsAt
          ? {
              text: `Your subscription ends on ${endsAt}, then you move to the free plan`,
              tone: 'warning',
            }
          : null,
      };

    case 'pausing':
      return {
        badge: { label: 'Pausing', variant: 'warning' },
        banner: {
          title: 'Subscription will be paused',
          description: endsAt
            ? `Your subscription pauses on ${endsAt}. While it is paused your organization is on the free plan${resumesAt ? `, and billing resumes on ${resumesAt}` : ''}.`
            : 'Your subscription pauses at the end of the current period. While it is paused your organization is on the free plan.',
          cta: 'Keep subscription',
          tone: 'warning',
        },
        statusLine: endsAt
          ? {
              text: `Your subscription will be paused on ${endsAt}`,
              tone: 'warning',
            }
          : {
              text: 'Your subscription will be paused at the end of the current period',
              tone: 'warning',
            },
      };

    case 'paused':
      return {
        badge: { label: 'Paused', variant: 'warning' },
        banner: {
          title: 'Subscription paused',
          description: resumesAt
            ? `Your subscription is paused and resumes on ${resumesAt}. Until then your organization is on the free plan.`
            : 'Your subscription is paused and your organization is on the free plan. Resume any time to get your plan limits back.',
          cta: 'Resume subscription',
          tone: 'warning',
        },
        statusLine: {
          text: resumesAt
            ? `Your subscription is paused until ${resumesAt}`
            : 'Your subscription is paused',
          tone: 'warning',
        },
      };

    case 'past_due':
      return {
        badge: { label: 'Past due', variant: 'warning' },
        banner: {
          title: 'Payment past due',
          description:
            'Your last payment failed. Update your payment method to stay on your current plan, otherwise your organization moves to the free plan.',
          cta: 'Update payment',
          tone: 'warning',
        },
        statusLine: {
          text: 'Your last payment failed. Please update your payment method.',
          tone: 'destructive',
        },
      };

    case 'incomplete':
      return {
        badge: { label: 'Incomplete', variant: 'warning' },
        banner: {
          title: 'Finish setting up your subscription',
          description:
            'Your subscription setup is incomplete. Complete checkout to activate it.',
          cta: 'Complete checkout',
          tone: 'warning',
        },
        statusLine: {
          text: 'Your subscription setup is incomplete.',
          tone: 'destructive',
        },
      };

    default: {
      // Exhaustiveness guard — every SubscriptionState must be handled above.
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
