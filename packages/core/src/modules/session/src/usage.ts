// After each session_end (and hourly for orgs on free limits, see
// refreshFreeUsage) the owning project's and organization's event counters
// are refreshed, at most once an hour per project, and usage alert emails go
// out at 80% / 100% of the billing limit.

import type { Organization } from '@openpanel/db/src/prisma-client';
import {
  getSubscriptionState,
  type SubscriptionStateInput,
} from '@openpanel/payments/subscription-state';
import { cacheablePerDeps } from '../../../cacheable-per-deps';
import { sendEmail } from '../../../clients/email';
import type { ServiceDeps } from '../../../services';
import { STORED_ADMIN_ROLES } from '../../organization/organization.constants';
import { getOrganizationBillingEventsCount } from '../../organization/organization.service';
import { getProjectEventsCount } from '../../project/project.service';

const INT4_MAX = 2_147_483_647;
const USAGE_WARNING_THRESHOLD = 0.8;
const UPDATE_EVENTS_COUNT_CACHE_SECONDS = 60 * 60;
const DEFAULT_DASHBOARD_URL = 'https://app.privytics.com';

/** Saturating: the columns are INT4 and lifetime counts can exceed them. */
function clampToInt4(count: number): number {
  return Math.min(count, INT4_MAX);
}

/**
 * Privytics: free (and paused) organizations are metered on the UTC calendar
 * month with no Polar webhook to reset their markers, so a marker from an
 * earlier month counts as unset. Paid markers are reset by the webhook.
 */
function onFreeLimits(organization: SubscriptionStateInput): boolean {
  const state = getSubscriptionState(organization);
  return state === 'free' || state === 'paused';
}

function utcMonthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function currentMarker(
  organization: Organization,
  marker: Date | null,
  now: Date
): Date | null {
  if (marker && onFreeLimits(organization) && marker < utcMonthStart(now)) {
    return null;
  }
  return marker;
}

function nextExceededAt(
  organization: Organization,
  count: number,
  selfHosted: boolean,
  now: Date
): Date | null {
  // Self-hosting has no billing limits: never flag, and clear any stale flag (default
  // limit 0 trips on the first event).
  if (selfHosted) {
    return null;
  }
  const limit = organization.subscriptionPeriodEventsLimit;
  const exceededAt = currentMarker(
    organization,
    organization.subscriptionPeriodEventsCountExceededAt,
    now
  );
  if (count > limit && !exceededAt) {
    return now;
  }
  if (count <= limit) {
    return null;
  }
  return exceededAt;
}

export const updateEventsCount = cacheablePerDeps(
  'updateEventsCount',
  async (deps: ServiceDeps, projectId: string): Promise<true | undefined> => {
    const logger = deps.logger;
    const db = deps.db;
    const organization = await db.organization.findFirst({
      where: { projects: { some: { id: projectId } } },
      include: { projects: true },
    });

    if (!organization) {
      return;
    }

    // One clock for the counted window and every marker below: a count of
    // last month finishing after midnight must not be stamped into this one.
    const now = new Date();
    const organizationEventsCount = await getOrganizationBillingEventsCount(
      deps,
      organization,
      now
    );
    const projectEventsCount = await getProjectEventsCount(deps, projectId);

    if (projectEventsCount) {
      // Only a sort key and activity threshold, never billing — clamping is safe.
      await db.project.update({
        where: { id: projectId },
        data: { eventsCount: clampToInt4(projectEventsCount) },
      });
    }

    // A new month with no events yet must still clear last month's count and
    // flag, so 0 is a real value here.
    if (organizationEventsCount !== undefined) {
      await db.organization.update({
        where: { id: organization.id },
        data: {
          subscriptionPeriodEventsCount: clampToInt4(organizationEventsCount),
          subscriptionPeriodEventsCountExceededAt: nextExceededAt(
            organization,
            organizationEventsCount,
            deps.config.selfHosted,
            now
          ),
        },
      });

      if (!deps.config.selfHosted) {
        try {
          await sendUsageAlerts(
            deps,
            organization,
            organizationEventsCount,
            now
          );
        } catch (error) {
          logger.error({ err: error }, 'Failed to send usage alert emails');
        }
      }
    }

    return true;
  },
  UPDATE_EVENTS_COUNT_CACHE_SECONDS
);

/**
 * Privytics: the free hard cap reads the exceeded flag, which otherwise only
 * session_end refreshes. Server-side SDK, AI and past-timestamp events never
 * end a session, so every org on free limits is refreshed hourly. Zero
 * allowance orgs are already refused at ingest and are skipped.
 *
 * ponytail: reads every live org each hour; prefilter on subscriptionStatus if
 * the table ever gets large.
 */
export async function refreshFreeUsage(
  deps: ServiceDeps
): Promise<{ refreshed: number; failed: number } | null> {
  if (deps.config.selfHosted) {
    return null;
  }

  const organizations = await deps.db.organization.findMany({
    where: {
      deleteAt: null,
      subscriptionPeriodEventsLimit: { gt: 0 },
      projects: { some: {} },
    },
    select: {
      id: true,
      subscriptionStatus: true,
      subscriptionCanceledAt: true,
      subscriptionEndsAt: true,
      subscriptionPauseAtPeriodEnd: true,
      projects: { select: { id: true }, take: 1 },
    },
  });

  let refreshed = 0;
  let failed = 0;
  for (const organization of organizations) {
    const projectId = organization.projects[0]?.id;
    if (!(projectId && onFreeLimits(organization))) {
      continue;
    }
    try {
      // A cached session_end refresh would otherwise skip this hour.
      await updateEventsCount.clear(deps, projectId);
      await updateEventsCount(deps, projectId);
      refreshed++;
    } catch (error) {
      failed++;
      deps.logger.error(
        { err: error, organizationId: organization.id },
        'Failed to refresh free usage'
      );
    }
  }

  return { refreshed, failed };
}

/**
 * One warning at 80% and one notice at 100% per billing cycle. The sent-at
 * markers are cleared by the Polar webhook when a new cycle resets the usage
 * counter (or the limit is raised), so each cycle can alert again.
 */
async function sendUsageAlerts(
  deps: ServiceDeps,
  organization: Organization,
  count: number,
  now: Date
) {
  const logger = deps.logger;
  const limit = organization.subscriptionPeriodEventsLimit;
  if (!limit || limit <= 0) {
    return;
  }

  const isFree = onFreeLimits(organization);
  const monthStart = utcMonthStart(now);
  const exceeded =
    count > limit &&
    !currentMarker(organization, organization.usageExceededSentAt, now);
  const nearLimit =
    !exceeded &&
    count >= limit * USAGE_WARNING_THRESHOLD &&
    count <= limit &&
    !currentMarker(organization, organization.usageWarningSentAt, now);

  if (!(exceeded || nearLimit)) {
    return;
  }

  const db = deps.db;

  // Claim the alert atomically BEFORE sending: session jobs for different
  // projects of the same org can run concurrently, and both would otherwise
  // read null markers and double-send. Marking the warning together with the
  // exceeded notice keeps a both-thresholds-in-one-jump crossing from queueing
  // a redundant warning afterwards. Rolled back if every send fails.
  const claimedAt = now;
  const claimed = await db.organization.updateMany({
    where: {
      id: organization.id,
      ...(exceeded
        ? isFree
          ? {
              OR: [
                { usageExceededSentAt: null },
                { usageExceededSentAt: { lt: monthStart } },
              ],
            }
          : { usageExceededSentAt: null }
        : isFree
          ? {
              OR: [
                { usageWarningSentAt: null },
                { usageWarningSentAt: { lt: monthStart } },
              ],
            }
          : { usageWarningSentAt: null }),
    },
    data: exceeded
      ? { usageExceededSentAt: claimedAt, usageWarningSentAt: claimedAt }
      : { usageWarningSentAt: claimedAt },
  });
  if (claimed.count === 0) {
    return;
  }

  try {
    const admins = await db.member.findMany({
      where: {
        organizationId: organization.id,
        role: { in: STORED_ADMIN_ROLES },
        user: { deletedAt: null },
      },
      include: { user: { select: { email: true, firstName: true } } },
    });

    const billingUrl = `${deps.config.dashboardUrl || DEFAULT_DASHBOARD_URL}/${organization.id}/billing`;
    const recipients = new Map<string, string | undefined>();
    for (const member of admins) {
      if (member.user?.email) {
        recipients.set(member.user.email, member.user.firstName ?? undefined);
      }
    }

    let failedRecipients = 0;
    for (const [email, firstName] of recipients) {
      // One bad address must not abort the loop or roll back the claim —
      // that would re-email the recipients that succeeded.
      try {
        if (exceeded) {
          await sendEmail('usage-limit-exceeded', {
            to: email,
            data: {
              firstName,
              organizationName: organization.name,
              billingUrl,
              eventsLimit: limit,
              isFreePlan: isFree,
            },
          });
        } else {
          await sendEmail('usage-near-limit', {
            to: email,
            data: {
              firstName,
              organizationName: organization.name,
              billingUrl,
              eventsCount: count,
              eventsLimit: limit,
              isFreePlan: isFree,
            },
          });
        }
      } catch (error) {
        failedRecipients++;
        logger.error(
          { err: error, organizationId: organization.id, recipient: email },
          'Failed to send usage alert to recipient'
        );
      }
    }

    logger.info(
      {
        organizationId: organization.id,
        count,
        limit,
        kind: exceeded ? 'exceeded' : 'near-limit',
        recipients: recipients.size,
        failedRecipients,
      },
      'Sent usage alert emails'
    );
  } catch (error) {
    // Release the claim so the next usage update retries the alert.
    await db.organization.updateMany({
      where: { id: organization.id },
      data: exceeded
        ? {
            usageExceededSentAt: null,
            usageWarningSentAt: organization.usageWarningSentAt,
          }
        : { usageWarningSentAt: null },
    });
    throw error;
  }
}
