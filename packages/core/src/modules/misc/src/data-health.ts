// Prisma, the last-event lookup and `sendEmail` arrive as injected deps so
// the job is testable without `mock.module`. `misc.jobs.ts` binds them off
// the job's ctx.

import type {
  AccessLevel,
  ProjectScope,
} from '@openpanel/db/src/prisma-client';
import type { CoreConfig } from '../../../config';
import type { Logger } from '../../../logger';
import { resolveProjectAccess } from '../../../shared/access-lookups';
import { MS_PER_DAY } from '../../../shared/time.constants';

// A brand-new project gets 48h to send its first event before we reach out.
const NO_DATA_AFTER_MS = 2 * MS_PER_DAY;
// An active project whose newest event is older than this counts as stalled.
const STALLED_AFTER_MS = 7 * MS_PER_DAY;
// Ingest refuses a capped free org's events once the flag lands (plus the 5
// minute org cache), so a last event this close to it means the cap stopped it.
const CAP_STALL_SLACK_MS = 60 * 60 * 1000;
const DEFAULT_DASHBOARD_URL = 'https://app.privytics.com';
// Privytics has no trial: every paid state plus the permanent free tier (the
// acquisition wedge). Unfinished checkouts and paused plans are skipped.
const RESCUE_STATES = new Set<string>([
  'active',
  'free',
  'canceling',
  'pausing',
  'past_due',
]);

interface OrgAlert {
  organizationId: string;
  noData: { id: string; name: string }[];
  stalled: { id: string; name: string; lastEventAt: Date }[];
}

/** The project row shape this job reads. */
export interface DataHealthProject {
  id: string;
  name: string;
  createdAt: Date;
  organizationId: string;
  noDataNotifiedAt: Date | null;
  dataStoppedNotifiedAt: Date | null;
  organization: {
    id: string;
    subscriptionState: string;
    subscriptionPeriodEventsLimit: number;
    subscriptionPeriodEventsCountExceededAt: Date | null;
    onboarding: string | null;
  };
}

export interface DataHealthMember {
  role: string;
  projectScope: ProjectScope;
  projects: { projectId: string; level: AccessLevel | null }[];
  user: { email: string | null; firstName: string | null } | null;
}

interface Recipient {
  firstName: string | undefined;
  canOpen(projectId: string): boolean;
}

/** The Prisma surface this job touches — nothing wider. */
export interface DataHealthDb {
  member: { findMany(args: unknown): Promise<DataHealthMember[]> };
  project: {
    findMany(args: unknown): Promise<DataHealthProject[]>;
    updateMany(args: unknown): Promise<unknown>;
  };
}

export type DataHealthTemplate = 'tracking-no-data' | 'tracking-data-stopped';

export interface DataHealthDeps {
  db: DataHealthDb;
  logger: Logger;
  config: CoreConfig;
  getLastEventPerProject(): Promise<Map<string, Date>>;
  sendEmail(
    template: DataHealthTemplate,
    options: { to: string; data: Record<string, unknown> }
  ): Promise<unknown>;
}

/** Members by email; each alert lists only the projects that member can open. */
async function recipientsForOrg(
  organizationId: string,
  deps: DataHealthDeps
): Promise<Map<string, Recipient>> {
  const members = await deps.db.member.findMany({
    where: {
      organizationId,
      user: { deletedAt: null },
    },
    select: {
      role: true,
      projectScope: true,
      projects: { select: { projectId: true, level: true } },
      user: { select: { email: true, firstName: true } },
    },
  });
  const recipients = new Map<string, Recipient>();
  for (const member of members) {
    const email = member.user?.email;
    if (!email || recipients.has(email)) {
      continue;
    }
    recipients.set(email, {
      firstName: member.user?.firstName ?? undefined,
      canOpen: (projectId) =>
        resolveProjectAccess({
          role: member.role,
          projectScope: member.projectScope,
          grant:
            member.projects.find((row) => row.projectId === projectId) ?? null,
        }) !== null,
    });
  }
  return recipients;
}

export interface DataHealthResult extends Record<string, number> {
  projects: number;
  organizations: number;
  emailsSent: number;
}

/**
 * Daily rescue emails for paying/trialing orgs whose tracking is broken:
 * projects that never received an event (48h grace) and projects whose event
 * flow stalled for 7+ days. A silently broken install reads as "the product
 * stopped working" — a working install is the cheapest retention there is.
 *
 * Dedupe: `noDataNotifiedAt` is sent once per project; `dataStoppedNotifiedAt`
 * is compared against the newest event, so data resuming and stalling again
 * notifies again without any clearing step.
 */
export async function runDataHealthCron(
  deps: DataHealthDeps
): Promise<DataHealthResult | null> {
  if (deps.config.selfHosted) {
    return null;
  }

  const now = Date.now();
  const today = new Date(now);
  const monthStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  );
  const lastEventByProject = await deps.getLastEventPerProject();

  // Prefilter on the raw status column (computed fields can't be used in
  // `where`), then refine with the canonical subscription state below.
  const projects = await deps.db.project.findMany({
    where: {
      deleteAt: null,
      organization: {
        OR: [
          {
            subscriptionStatus: {
              in: ['active', 'free', 'past_due', 'canceled'],
            },
          },
          { subscriptionStatus: null },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      organizationId: true,
      noDataNotifiedAt: true,
      dataStoppedNotifiedAt: true,
      organization: {
        select: {
          id: true,
          subscriptionState: true,
          subscriptionPeriodEventsLimit: true,
          subscriptionPeriodEventsCountExceededAt: true,
          onboarding: true,
        },
      },
    },
  });

  const byOrg = new Map<string, OrgAlert>();

  for (const project of projects) {
    const state = project.organization.subscriptionState;
    const exceededAt =
      project.organization.subscriptionPeriodEventsCountExceededAt;
    // A zero allowance, or a free org over this month's allowance, means
    // ingestion refuses its events on purpose, so a "snippet not installed"
    // email would mislead.
    if (
      !RESCUE_STATES.has(state) ||
      project.organization.subscriptionPeriodEventsLimit <= 0 ||
      (state === 'free' && exceededAt && exceededAt >= monthStart)
    ) {
      continue;
    }

    const lastEventAt = lastEventByProject.get(project.id);

    if (!lastEventAt) {
      // Never received an event. One notice per project, after the grace
      // period. Orgs still in the onboarding email drip are excluded — its
      // day-2/6 emails already carry "stuck on the install?" variants, so this
      // notice targets post-onboarding orgs and additional projects.
      const inOnboardingDrip = project.organization.onboarding !== 'completed';
      const oldEnough = now - project.createdAt.getTime() > NO_DATA_AFTER_MS;
      if (oldEnough && !project.noDataNotifiedAt && !inOnboardingDrip) {
        const entry = byOrg.get(project.organizationId) ?? {
          organizationId: project.organizationId,
          noData: [],
          stalled: [],
        };
        entry.noData.push({ id: project.id, name: project.name });
        byOrg.set(project.organizationId, entry);
      }
      continue;
    }

    // A stall that began at a free org's cap only counts from when the cap
    // lifted (the next UTC month), not from the last event it let through.
    const stalledAtCap =
      state === 'free' &&
      exceededAt !== null &&
      lastEventAt.getTime() <= exceededAt.getTime() + CAP_STALL_SLACK_MS;
    const silentSince = stalledAtCap
      ? Date.UTC(exceededAt.getUTCFullYear(), exceededAt.getUTCMonth() + 1, 1)
      : lastEventAt.getTime();
    const stalled = now - silentSince > STALLED_AFTER_MS;
    const alreadyNotifiedForThisStall =
      project.dataStoppedNotifiedAt &&
      project.dataStoppedNotifiedAt > lastEventAt;
    if (stalled && !alreadyNotifiedForThisStall) {
      const entry = byOrg.get(project.organizationId) ?? {
        organizationId: project.organizationId,
        noData: [],
        stalled: [],
      };
      entry.stalled.push({
        id: project.id,
        name: project.name,
        lastEventAt,
      });
      byOrg.set(project.organizationId, entry);
    }
  }

  let emailsSent = 0;

  for (const alert of byOrg.values()) {
    try {
      const recipients = await recipientsForOrg(alert.organizationId, deps);
      if (recipients.size === 0) {
        continue;
      }

      const dashboardUrl = `${deps.config.dashboardUrl || DEFAULT_DASHBOARD_URL}/${alert.organizationId}`;

      if (alert.noData.length > 0) {
        // Only projects someone was told about: one nobody here can open
        // stays unmarked, so a member granted access later still hears of it.
        const alertedIds = new Set<string>();
        for (const [to, recipient] of recipients) {
          const visible = alert.noData.filter((p) => recipient.canOpen(p.id));
          if (visible.length === 0) {
            continue;
          }
          for (const p of visible) {
            alertedIds.add(p.id);
          }
          // Per-recipient guard: one bad address must not block the marker
          // update below — that would re-email everyone tomorrow.
          try {
            await deps.sendEmail('tracking-no-data', {
              to,
              data: {
                firstName: recipient.firstName,
                projectNames: visible.map((p) => p.name),
                dashboardUrl,
              },
            });
            emailsSent++;
          } catch (err) {
            deps.logger.error(
              { err, organizationId: alert.organizationId, recipient: to },
              'Failed to send no-data alert to recipient'
            );
          }
        }
        await deps.db.project.updateMany({
          where: { id: { in: [...alertedIds] } },
          data: { noDataNotifiedAt: new Date() },
        });
      }

      if (alert.stalled.length > 0) {
        const alertedIds = new Set<string>();
        for (const [to, recipient] of recipients) {
          const visible = alert.stalled.filter((p) => recipient.canOpen(p.id));
          if (visible.length === 0) {
            continue;
          }
          for (const p of visible) {
            alertedIds.add(p.id);
          }
          const newestLastEvent = visible
            .map((p) => p.lastEventAt)
            .sort((a, b) => b.getTime() - a.getTime())[0];
          try {
            await deps.sendEmail('tracking-data-stopped', {
              to,
              data: {
                firstName: recipient.firstName,
                projectNames: visible.map((p) => p.name),
                lastEventDate: newestLastEvent?.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                }),
                dashboardUrl,
              },
            });
            emailsSent++;
          } catch (err) {
            deps.logger.error(
              { err, organizationId: alert.organizationId, recipient: to },
              'Failed to send data-stopped alert to recipient'
            );
          }
        }
        await deps.db.project.updateMany({
          where: { id: { in: [...alertedIds] } },
          data: { dataStoppedNotifiedAt: new Date() },
        });
      }
    } catch (err) {
      deps.logger.error(
        { err, organizationId: alert.organizationId },
        'Data-health alert failed'
      );
    }
  }

  const result: DataHealthResult = {
    projects: projects.length,
    organizations: byOrg.size,
    emailsSent,
  };

  deps.logger.info(result, 'Data-health check complete');

  return result;
}
