function formatEventsCount(events: number) {
  return new Intl.NumberFormat('en-gb', {
    notation: 'compact',
  }).format(events);
}

export type IPrice = {
  price: number;
  events: number;
  discount?: {
    code: string;
    amount: number;
    id: string;
  };
  popular?: boolean;
};

// Privytics paid tiers (EUR). Stepped by event volume; no per-event/usage
// billing. The free 10k tier is FREE_TIER_EVENTS_LIMIT below, not a product.
// Above 10M events is custom pricing and is not a self-serve product.
export const PRICING: IPrice[] = [
  { price: 10, events: 100_000 },
  { price: 20, events: 500_000 },
  { price: 40, events: 1_000_000, popular: true },
  { price: 100, events: 5_000_000 },
  { price: 200, events: 10_000_000 },
];

// The permanent free tier allowance. New organizations start here (see
// packages/core/src/modules/onboarding/onboarding.service.ts), are metered
// against it on a calendar-month window, and are hard-capped at ingestion once
// they exceed it (see packages/core/src/modules/ingest/ingest.routes.ts).
//
// Upstream's FREE_PRODUCT_IDS list was removed with the dashboard block it fed:
// on Privytics the free tier is the `free` subscription state, not a Polar
// product, and it never locks an organization out.
export const FREE_TIER_EVENTS_LIMIT = 10_000;

// Currency for our own plan prices. Kept separate from the currency used to
// display a customer's tracked revenue, which is their data and not ours to
// relabel: the number formatter still defaults to USD for that.
export const BILLING_CURRENCY = 'EUR';

export function getRecommendedPlan<T>(
  monthlyEvents: number | undefined | null,
  cb: (
    options: {
      formattedEvents: string;
      formattedPrice: string;
    } & IPrice
  ) => T
): T | undefined {
  if (!monthlyEvents) {
    return undefined;
  }
  const price = PRICING.find((price) => price.events >= monthlyEvents);
  if (!price) {
    return undefined;
  }
  return cb({
    ...price,
    formattedEvents: formatEventsCount(price.events),
    formattedPrice: Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(price.price),
  });
}
