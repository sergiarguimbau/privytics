import { z } from 'zod';
import { defineJob } from '../../jobs/define';
import { refreshFreeUsage } from '../session/src/usage';

/**
 * This module's fragment of the `cron` queue's jobs.
 *
 * Privytics: upstream's hourly `windDown` cron is not registered. There is no
 * trial to wind down, and its prefilter matches legacy production rows, so a
 * regression in the state function could block ingestion and schedule real
 * customer data for deletion. `startSchedulers` prunes the old Redis scheduler
 * at boot. `src/wind-down.ts` stays as upstream code, unscheduled.
 */
export const organizationCronJobs = {
  delete: defineJob({
    payload: z.null(),
    cron: { pattern: '0 * * * *' },
    handler: async ({ ctx }) => {
      const result = await ctx.services.organization.runDeleteCron();
      ctx.logger.info({ ...result }, 'Delete cron complete');
    },
  }),
  // Privytics: free 12 months, paid 5 years (see runDataRetentionCron).
  dataRetention: defineJob({
    payload: z.null(),
    cron: { pattern: '0 5 * * *' },
    handler: async ({ ctx }) => {
      const result = await ctx.services.organization.runDataRetentionCron();
      ctx.logger.info({ ...result }, 'Data retention sweep issued');
    },
  }),
  // Privytics: keeps the free hard cap's flag fresh for traffic that never
  // ends a session (see refreshFreeUsage).
  usageRefresh: defineJob({
    payload: z.null(),
    cron: { pattern: '5 * * * *' },
    handler: async ({ ctx }) => {
      const result = await refreshFreeUsage(ctx);
      ctx.logger.info({ ...result }, 'Free usage refresh complete');
    },
  }),
};
