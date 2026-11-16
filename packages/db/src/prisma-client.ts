import {
  getSubscriptionChartEndDate,
  getSubscriptionState,
  isSelfHostedEnv,
} from '@openpanel/payments/subscription-state';
import { PrismaClient } from './generated/prisma/client';
import { logger } from './logger';

export * from './generated/prisma/client';

const subscriptionStateNeeds = {
  subscriptionStatus: true,
  subscriptionCanceledAt: true,
  subscriptionEndsAt: true,
  subscriptionPauseAtPeriodEnd: true,
} as const;

const getPrismaClient = () => {
  // emit: 'event' keeps the engine from writing prisma:error lines straight
  // to stderr, so they flow through pino to the OTLP pipeline instead.
  const client = new PrismaClient({
    // Prisma's default error format splices file, line and a source snippet
    // into messages that reach API clients verbatim. `minimal` keeps our
    // source layout out of a 500.
    errorFormat: 'minimal',
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

  // $on only exists on the base client — keep it before $extends.
  client.$on('error', (event) => {
    logger.error({ target: event.target }, `prisma: ${event.message}`);
  });
  client.$on('warn', (event) => {
    logger.warn({ target: event.target }, `prisma: ${event.message}`);
  });

  const prisma = client.$extends({
    result: {
      organization: {
        subscriptionState: {
          needs: subscriptionStateNeeds,
          compute(org) {
            return getSubscriptionState(org);
          },
        },
        subscriptionStatus: {
          needs: { subscriptionStatus: true, subscriptionCanceledAt: true },
          compute(org) {
            if (isSelfHostedEnv()) {
              return 'active';
            }

            // No status means no paid subscription, which on Privytics is the
            // permanent free tier rather than a trial.
            return org.subscriptionStatus || 'free';
          },
        },
        hasSubscription: {
          needs: subscriptionStateNeeds,
          compute(org) {
            const state = getSubscriptionState(org);
            return (
              state === 'active' ||
              state === 'canceling' ||
              state === 'pausing' ||
              state === 'paused' ||
              state === 'past_due' ||
              state === 'incomplete'
            );
          },
        },
        slug: {
          needs: { id: true },
          compute(org) {
            return org.id;
          },
        },
        subscriptionChartEndDate: {
          needs: {
            ...subscriptionStateNeeds,
            subscriptionPeriodEventsCountExceededAt: true,
          },
          compute(org) {
            return getSubscriptionChartEndDate(org);
          },
        },
        isActive: {
          needs: subscriptionStateNeeds,
          compute(org) {
            const state = getSubscriptionState(org);
            return (
              state === 'active' || state === 'self_hosted' || state === 'free'
            );
          },
        },
        // Privytics has no trial, and a paid plan that ends drops the
        // organization to the permanent free tier rather than to a canceled or
        // expired dead-end. `isTrial`, `isCanceled` and `isExpired` therefore
        // no longer exist; use `isActive` (true on free) and
        // `isWillBeCanceled` (paid, ending at period end) instead.
        isWillBeCanceled: {
          needs: subscriptionStateNeeds,
          compute(org) {
            return getSubscriptionState(org) === 'canceling';
          },
        },
        isExceeded: {
          needs: {
            subscriptionPeriodEventsCount: true,
            subscriptionPeriodEventsLimit: true,
          },
          compute(org) {
            if (isSelfHostedEnv()) {
              return false;
            }

            return (
              org.subscriptionPeriodEventsCount >
              org.subscriptionPeriodEventsLimit
            );
          },
        },
        subscriptionCurrentPeriodStart: {
          needs: { subscriptionStartsAt: true, subscriptionInterval: true },
          compute(org) {
            if (isSelfHostedEnv()) {
              return null;
            }

            if (!org.subscriptionStartsAt) {
              return null;
            }

            if (org.subscriptionInterval === 'year') {
              const startDay = org.subscriptionStartsAt.getUTCDate();
              const now = new Date();
              return new Date(
                Date.UTC(
                  now.getUTCFullYear(),
                  now.getUTCMonth(),
                  startDay,
                  0,
                  0,
                  0,
                  0
                )
              );
            }

            return org.subscriptionStartsAt;
          },
        },
        subscriptionCurrentPeriodEnd: {
          needs: {
            subscriptionStartsAt: true,
            subscriptionEndsAt: true,
            subscriptionInterval: true,
          },
          compute(org) {
            if (isSelfHostedEnv()) {
              return null;
            }

            if (!org.subscriptionStartsAt) {
              return null;
            }

            if (org.subscriptionInterval === 'year') {
              const startDay = org.subscriptionStartsAt.getUTCDate();
              const now = new Date();
              return new Date(
                Date.UTC(
                  now.getUTCFullYear(),
                  now.getUTCMonth() + 1,
                  startDay - 1,
                  0,
                  0,
                  0,
                  0
                )
              );
            }

            return org.subscriptionEndsAt;
          },
        },
      },
    },
  });

  return prisma;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof getPrismaClient>;
};

export const db = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
