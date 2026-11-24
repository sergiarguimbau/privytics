import { createHmac, timingSafeEqual } from 'node:crypto';
import { Polar } from '@polar-sh/sdk';
import {
  validateEvent,
  WebhookVerificationError,
} from '@polar-sh/sdk/webhooks';

export { WebhookVerificationError as PolarWebhookVerificationError };

const SECRET_PREFIX = 'whsec_';

const sign = (key: Buffer, content: string) =>
  createHmac('sha256', key).update(content).digest('base64');

/**
 * Polar signs with Standard Webhooks (key: base64-decode of what follows
 * `whsec_`) for secrets generated on or after 8 Sep 2026, and with the UTF-8
 * bytes of the whole secret before that. SDK 0.49 only knows the older key, so
 * when the newer one matches, re-sign with the older key and let the SDK check
 * the timestamp and parse the event.
 * ponytail: plain validateEvent once @polar-sh/sdk >= 1.0.0-alpha.19, which tries both keys.
 */
export function validatePolarEvent(
  body: string | Buffer,
  headers: Record<string, string>,
  secret: string
): ReturnType<typeof validateEvent> {
  try {
    return validateEvent(body, headers, secret);
  } catch (err) {
    if (
      !(err instanceof WebhookVerificationError) ||
      !secret.startsWith(SECRET_PREFIX)
    ) {
      throw err;
    }
    const content = `${headers['webhook-id']}.${headers['webhook-timestamp']}.${body.toString()}`;
    const expected = Buffer.from(
      sign(Buffer.from(secret.slice(SECRET_PREFIX.length), 'base64'), content)
    );
    const signedWithStandardKey = (headers['webhook-signature'] ?? '')
      .split(' ')
      .some((versioned) => {
        const [version, signature = ''] = versioned.split(',');
        const given = Buffer.from(signature);
        return (
          version === 'v1' &&
          given.length === expected.length &&
          timingSafeEqual(given, expected)
        );
      });
    if (!signedWithStandardKey) {
      throw err;
    }
    return validateEvent(
      body,
      {
        ...headers,
        'webhook-signature': `v1,${sign(Buffer.from(secret), content)}`,
      },
      secret
    );
  }
}

export type IPolarProduct = Awaited<ReturnType<typeof getProduct>>;
export type IPolarPrice = IPolarProduct['prices'][number];

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

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
    isArchived: false,
    sorting: ['price_amount'],
  });
  return products.result.items.filter((product) => !isCustomProduct(product));
}

/** Made for one organization by `create-custom-pricing`; `metadata.organizationId` says which. */
export function isCustomProduct(product: Pick<IPolarProduct, 'metadata'>) {
  return product.metadata.custom === 'true' || product.metadata.custom === true;
}

export async function getProduct(id: string) {
  return polar.products.get({ id });
}

export function getSubscription(id: string) {
  return polar.subscriptions.get({ id });
}

export async function createPortal({ customerId }: { customerId: string }) {
  return polar.customerSessions.create({
    customerId,
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
    successUrl: getSuccessUrl(
      process.env.DASHBOARD_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL!,
      organizationId
    ),
    customerEmail: user.email,
    customerName: [user.firstName, user.lastName].filter(Boolean).join(' '),
    customerIpAddress: ipAddress,
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
    return await polar.subscriptions.update({
      id: subscriptionId,
      subscriptionUpdate: {
        cancelAtPeriodEnd: true,
        customerCancellationReason: cancellation?.reason ?? null,
        customerCancellationComment: cancellation?.comment ?? null,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      // Don't throw an error if the subscription is already canceled
      if (error.name === 'AlreadyCanceledSubscription') {
        return polar.subscriptions.get({ id: subscriptionId });
      }
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
  return polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      pauseAtPeriodEnd: true,
      resumesAt: resumesAt ?? null,
    },
  });
}

/** Cancel a scheduled pause while the subscription is still active. */
export function unpauseSubscription(subscriptionId: string) {
  return polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      pauseAtPeriodEnd: false,
    },
  });
}

/**
 * Resume an already-paused subscription immediately — starts a new billing
 * period and charges the customer.
 */
export function resumeSubscription(subscriptionId: string) {
  return polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      resume: true,
    },
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
  return polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      discountId,
    },
  });
}

export function reactivateSubscription(subscriptionId: string) {
  return polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      cancelAtPeriodEnd: false,
    },
  });
}

export function changeSubscription(subscriptionId: string, productId: string) {
  return polar.subscriptions.update({
    id: subscriptionId,
    subscriptionUpdate: {
      productId,
      prorationBehavior: 'invoice',
    },
  });
}
