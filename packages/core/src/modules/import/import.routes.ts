// `allow: ['read', 'root']`: a `write`-type client may not import.
//
// The body is typed but not shape-validated for this route.
//
// `client.projectId` is `null` for a root client, hence the explicit guard
// before importing.

import {
  getSubscriptionState,
  type SubscriptionStateInput,
} from '@openpanel/payments/subscription-state';
import { z } from 'zod';
import { defineRoutes } from '../../http/define';
import type { IClickhouseEvent } from '../event/event.service';
import { getOrganizationByProjectIdCached } from '../organization/organization.service';
import { insertRawEventsBatch } from './import.service';

/**
 * Privytics: imports are paid-only. They write straight into `events`, past
 * the free tier's hard cap, so an org on free limits (free, paused, an unpaid
 * checkout, or with no allowance) is refused. Not `isActive`: that is true on free.
 */
export function canImport(
  organization:
    | (SubscriptionStateInput & { subscriptionPeriodEventsLimit: number })
    | null,
  selfHosted: boolean
): boolean {
  if (selfHosted) {
    return true;
  }
  if (!organization) {
    return false;
  }
  const state = getSubscriptionState(organization);
  return (
    state !== 'free' &&
    state !== 'paused' &&
    state !== 'incomplete' &&
    organization.subscriptionPeriodEventsLimit > 0
  );
}

export const importRoutes = defineRoutes((app) =>
  app.post(
    '/import/events',
    async ({ body, client, ctx, status }) => {
      if (!client.projectId) {
        return status(400, 'Missing project id');
      }
      const organization = ctx.config.selfHosted
        ? null
        : await getOrganizationByProjectIdCached(ctx, client.projectId);
      if (!canImport(organization, ctx.config.selfHosted)) {
        return status(403, 'Importing events requires a paid plan');
      }

      try {
        const { writtenRows } = await insertRawEventsBatch(
          ctx,
          client.projectId,
          body as IClickhouseEvent[]
        );
        ctx.logger.info({ writtenRows }, 'events imported');
        return 'OK';
      } catch (error) {
        ctx.logger.error({ err: error }, 'Failed to import events');
        return status(500, 'Error');
      }
    },
    {
      clientAuth: { allow: ['read', 'root'], label: 'Import' },
      body: z.array(z.unknown()),
      detail: {
        tags: ['Import'],
        description: 'Bulk import historical events.',
      },
    }
  )
);
