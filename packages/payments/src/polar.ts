import {
  createPolar,
  errors,
  type models,
  webhooks,
} from '@polar-sh/sdk/2026-10';

/**
 * Verifies the signature (Polar's original key and the Standard Webhooks key
 * Polar uses for secrets from 8 Sep 2026) and the timestamp, then returns the
 * payload as Polar sent it: snake_case, timestamps as ISO strings. Async.
 */
export const {
  validateEvent: validatePolarEvent,
  PolarWebhookVerificationError,
} = webhooks;

export type IPolarProduct = Awaited<ReturnType<typeof getProduct>>;
export type IPolarPrice = IPolarProduct['prices'][number];

export const polar = createPolar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

const toDate = (value: string | null) => (value === null ? null : new Date(value));

/**
 * A Polar subscription as the sync logic reads it: the field names it has
 * always used, with timestamps as Dates. The API returns snake_case JSON with
 * ISO strings; `customer`, `prices` and `discount` are passed through as sent.
 */
export function toPolarSubscription(subscription: models.Subscription) {
  return {
    id: subscription.id,
    status: subscription.status,
    metadata: subscription.metadata,
    productId: subscription.product_id,
    customerId: subscription.customer_id,
    customer: subscription.customer,
    prices: subscription.prices,
    discount: subscription.discount,
    recurringInterval: subscription.recurring_interval,
    createdAt: new Date(subscription.created_at),
    currentPeriodStart: new Date(subscription.current_period_start),
    currentPeriodEnd: new Date(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: toDate(subscription.canceled_at),
    pauseAtPeriodEnd: subscription.pause_at_period_end,
    resumesAt: toDate(subscription.resumes_at),
    customerCancellationReason: subscription.customer_cancellation_reason,
    customerCancellationComment: subscription.customer_cancellation_comment,
  };
}

export type PolarSubscription = ReturnType<typeof toPolarSubscription>;

export const getSuccessUrl = (baseUrl: string, organizationId: string) =>
  `${baseUrl}/${organizationId}/billing`;

export async function getProducts() {
  // No Polar credentials (local dev, or a self-hosted instance without billing):
  // return an empty catalogue so the billing page shows "no plans to upgrade to"
  // rather than making a doomed API call. Paid plans only appear once
  // POLAR_ACCESS_TOKEN and the products are configured.
  if (!process.env.POLAR_ACCESS_TOKEN) {
    return [];
  }
  const products = await polar.products.list({
    limit: 100,
    is_archived: false,
    sorting: ['price_amount'],
  });
  return products.items.filter((product) => !isCustomProduct(product));
}

/** Made for one organization by `create-custom-pricing`; `metadata.organizationId` says which. */
export function isCustomProduct(product: Pick<IPolarProduct, 'metadata'>) {
  return product.metadata.custom === 'true' || product.metadata.custom === true;
}

export async function getProduct(id: string) {
  return polar.products.get(id);
}

/** The subscription as Polar has it now. */
export async function getSubscription(id: string) {
  return toPolarSubscription(await polar.subscriptions.get(id));
}

export async function createPortal({ customerId }: { customerId: string }) {
  return polar.customerSessions.create({
    customer_id: customerId,
  });
}

export async function createCheckout({
  productId,
  organizationId,
  user,
  ipAddress,
}: {
  productId: string;
  organizationId: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  ipAddress: string | undefined;
}) {
  return polar.checkouts.create({
    products: [productId],
    success_url: getSuccessUrl(
      process.env.DASHBOARD_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL!,
      organizationId
    ),
    customer_email: user.email,
    customer_name: [user.firstName, user.lastName].filter(Boolean).join(' '),
    customer_ip_address: ipAddress,
    metadata: {
      organizationId,
      userId: user.id,
    },
  });
}

export type ICancellationReason =
  | 'too_expensive'
  | 'missing_features'
  | 'switched_service'
  | 'unused'
  | 'customer_service'
  | 'low_quality'
  | 'too_complex'
  | 'other';

export async function cancelSubscription(
  subscriptionId: string,
  cancellation?: {
    reason?: ICancellationReason;
    comment?: string;
  }
) {
  try {
    return toPolarSubscription(
      await polar.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        customer_cancellation_reason: cancellation?.reason ?? null,
        customer_cancellation_comment: cancellation?.comment ?? null,
      })
    );
  } catch (error) {
    // Don't throw an error if the subscription is already canceled
    if (
      error instanceof errors.SubscriptionsUpdate403Error &&
      error.error.error === 'AlreadyCanceledSubscription'
    ) {
      return getSubscription(subscriptionId);
    }

    throw error;
  }
}

/**
 * Pause an active subscription at the end of the current period. Billing stops
 * but the subscription (and its payment method) is kept, so the customer can
 * come back without a new checkout. `resumesAt` must be after the current
 * period end; omitted means paused until manually resumed.
 */
export function pauseSubscription(subscriptionId: string, resumesAt?: Date) {
  return polar.subscriptions.update(subscriptionId, {
    pause_at_period_end: true,
    resumes_at: resumesAt?.toISOString() ?? null,
  });
}

/** Cancel a scheduled pause while the subscription is still active. */
export function unpauseSubscription(subscriptionId: string) {
  return polar.subscriptions.update(subscriptionId, {
    pause_at_period_end: false,
  });
}

/**
 * Resume an already-paused subscription immediately — starts a new billing
 * period and charges the customer.
 */
export function resumeSubscription(subscriptionId: string) {
  return polar.subscriptions.update(subscriptionId, {
    resume: true,
  });
}

/**
 * Attach a discount to an active subscription. Polar applies it starting with
 * the next billing cycle.
 */
export function applySubscriptionDiscount(
  subscriptionId: string,
  discountId: string
) {
  return polar.subscriptions.update(subscriptionId, {
    discount_id: discountId,
  });
}

export function reactivateSubscription(subscriptionId: string) {
  return polar.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export function changeSubscription(subscriptionId: string, productId: string) {
  return polar.subscriptions.update(subscriptionId, {
    product_id: productId,
    proration_behavior: 'invoice',
  });
}
