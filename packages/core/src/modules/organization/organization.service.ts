// `cacheable` keys on the call's arguments, so the caller's deps travel beside
// the key rather than inside it, or the Redis key would change per request.

import { sql } from '@openpanel/db/src/clickhouse/sql';
import type {
  AccessLevel,
  Invite,
  Prisma,
  User,
} from '@openpanel/db/src/prisma-client';
import { getSubscriptionState } from '@openpanel/payments/subscription-state';
import { DateTime, generateSecureId } from '@openpanel/shared';
import {
  cacheablePerDb,
  cacheablePerDeps,
  type DbScope,
} from '../../cacheable-per-deps';
import { chQuery } from '../../ch-query';
import { sendEmail } from '../../clients/email';
import {
  TRPCBadRequestError,
  TRPCForbiddenError,
  TRPCNotFoundError,
} from '../../rpc/errors';
import type { ServiceDeps, Services } from '../../services';

type MembershipDeps = Pick<ServiceDeps, 'db' | 'config'>;

import {
  getOrganizationAccess,
  getProjectAccess,
} from '../../shared/access-lookups';
import { formatClickhouseDate } from '../../shared/ch-dates';
import { replicatedTarget, TABLE_NAMES } from '../../shared/ch-tables';
import {
  DEFAULT_TIMEZONE,
  type InvitableRole,
  type IProjectAccessGrant,
  isValidTimezone,
  normalizeOrganizationRole,
  type OrganizationRole,
  type ProjectScope,
  STORED_ADMIN_ROLES,
} from './organization.constants';

export type IServiceOrganization = Awaited<
  ReturnType<typeof getOrganizationById>
>;
export type IServiceInvite = Omit<Invite, 'role'> & { role: OrganizationRole };
export type IServiceMember = Omit<
  Prisma.MemberGetPayload<{ include: { user: true } }>,
  'role' | 'projectScope'
> & {
  role: OrganizationRole;
  projectScope: ProjectScope;
  projects: { projectId: string; level: AccessLevel | null }[];
};

// Session bookkeeping rows are worker-generated (the reaper can emit
// session_end long after tracking stopped), so they are not billable activity.
const NON_BILLABLE_EVENT_NAMES = ['session_start', 'session_end'];

const DELETE_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;
const INVITE_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000;

export async function getOrganizations(
  deps: ServiceDeps,
  userId: string | null
) {
  if (!userId) {
    return [];
  }

  const db = deps.db;
  return db.organization.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getOrganizationById(
  deps: ServiceDeps,
  organizationId: string
) {
  const db = deps.db;
  return db.organization.findUniqueOrThrow({
    where: {
      id: organizationId,
    },
  });
}

export async function getOrganizationByProjectId(
  deps: DbScope,
  projectId: string
) {
  const db = deps.db;
  const project = await db.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
    include: {
      organization: true,
    },
  });

  if (!project.organization) {
    return null;
  }

  return project.organization;
}

const ORGANIZATION_BY_PROJECT_CACHE_TTL_SEC = 60 * 5;
// Per process, not per request: ingest reads it on every event.
export const getOrganizationByProjectIdCached = cacheablePerDb(
  'getOrganizationByProjectId',
  (deps: DbScope, projectId: string) =>
    getOrganizationByProjectId(deps, projectId),
  ORGANIZATION_BY_PROJECT_CACHE_TTL_SEC
);

export async function getInvites(
  deps: ServiceDeps,
  organizationId: string
): Promise<IServiceInvite[]> {
  const db = deps.db;
  const invites = await db.invite.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return invites.map((invite) => ({
    ...invite,
    role: normalizeOrganizationRole(invite.role),
  }));
}

export async function getInviteById(deps: ServiceDeps, inviteId: string) {
  const db = deps.db;
  const res = await db.invite.findUnique({
    where: {
      id: inviteId,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Spreading a null result gave `{isExpired: undefined}`, a truthy object, so
  // the onboarding page showed an invitation banner for a bogus id.
  if (!res) {
    throw new TRPCNotFoundError('Invite not found');
  }

  return {
    ...res,
    isExpired: res.expiresAt < new Date(),
  };
}

export async function getMembers(
  deps: ServiceDeps,
  organizationId: string
): Promise<IServiceMember[]> {
  const db = deps.db;
  const members = await db.member.findMany({
    where: {
      organizationId,
      userId: {
        not: null,
      },
    },
    include: {
      user: true,
      projects: { select: { projectId: true, level: true } },
    },
  });
  return members.map((member) => ({
    ...member,
    role: normalizeOrganizationRole(member.role),
  }));
}

function writeMemberProjects(
  deps: MembershipDeps,
  memberId: string,
  projectScope: ProjectScope,
  grants: IProjectAccessGrant[]
) {
  const db = deps.db;
  const selected = projectScope === 'all' ? [] : grants;
  return [
    db.member.update({
      where: { id: memberId },
      data: { projectScope },
    }),
    db.memberProject.deleteMany({ where: { memberId } }),
    db.memberProject.createMany({
      data: selected.map((grant) => ({
        memberId,
        projectId: grant.projectId,
        // Write is what the role gives; only a restriction is worth storing.
        level: grant.level === 'read' ? 'read' : null,
      })),
    }),
  ];
}

/**
 * The access lookups cache a granted answer for minutes, so every change to a
 * membership or its project grants must drop that user's entries for every
 * project of the organization. A grant on one project also revokes the
 * implicit org-wide default on all the others. Call it after the write, or a
 * concurrent request can cache the old answer again.
 */
async function clearMemberAccessCache(
  deps: MembershipDeps,
  { userId, organizationId }: { userId: string; organizationId: string }
): Promise<void> {
  const projects = await deps.db.project.findMany({
    where: { organizationId },
    select: { id: true },
  });
  await Promise.all([
    getOrganizationAccess.clear({ userId, organizationId }),
    ...projects.map((project) =>
      getProjectAccess.clear({ userId, projectId: project.id })
    ),
  ]);
}

export async function connectUserToOrganization(
  deps: MembershipDeps,
  {
    user,
    inviteId,
  }: {
    user: Pick<User, 'id' | 'email'>;
    inviteId: string;
  }
) {
  const db = deps.db;

  // Use primary since before this we might have just created the invite
  // If we use replica it might not find the invite
  const invite = await db.invite.findUnique({
    where: {
      id: inviteId,
    },
  });

  if (!invite) {
    throw new Error('Invite not found');
  }

  if (deps.config.auth.allowInvitation === false) {
    throw new Error('Invitations are not allowed');
  }

  if (invite.expiresAt < new Date()) {
    throw new Error('Invite expired');
  }

  const { projectScope } = invite;

  const existing = await db.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: invite.organizationId,
        userId: user.id,
      },
    },
  });

  // The invite might be consumed by a user who is already a member of the
  // organization (e.g. accepting it a second time). Upsert atomically against
  // the (organizationId, userId) unique constraint so concurrent consumption
  // cannot create duplicate membership rows; an existing membership is reused
  // unchanged, grants included, and the invite is still consumed below.
  const member = await db.member.upsert({
    where: {
      organizationId_userId: {
        organizationId: invite.organizationId,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: invite.organizationId,
      userId: user.id,
      role: invite.role,
      email: user.email,
      invitedById: invite.createdById,
      projectScope,
    },
  });

  if (!existing) {
    await db.$transaction(
      writeMemberProjects(deps, member.id, projectScope, invite.projectAccess)
    );
  }

  await clearMemberAccessCache(deps, {
    userId: user.id,
    organizationId: invite.organizationId,
  });

  // deleteMany: a concurrent acceptance may already have consumed it.
  await db.invite.deleteMany({
    where: {
      id: inviteId,
    },
  });

  return member;
}

/**
 * Join an organization from an invite while signed in. The session's email must
 * be the invited address, so an account that merely registered that address
 * without proving it still cannot take the invite without the link.
 */
export async function acceptInvite(
  deps: ServiceDeps,
  { userId, inviteId }: { userId: string; inviteId: string }
): Promise<{ organizationId: string }> {
  const [user, invite] = await Promise.all([
    deps.db.user.findUniqueOrThrow({ where: { id: userId } }),
    deps.db.invite.findUnique({ where: { id: inviteId } }),
  ]);

  if (!invite) {
    throw new TRPCNotFoundError('Invite not found');
  }
  if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new TRPCForbiddenError(
      'This invitation was sent to a different email address'
    );
  }
  if (deps.config.auth.allowInvitation === false) {
    throw new TRPCForbiddenError('Invitations are not allowed');
  }
  if (invite.expiresAt < new Date()) {
    throw new TRPCBadRequestError('This invitation has expired');
  }

  await connectUserToOrganization(deps, { user, inviteId });
  return { organizationId: invite.organizationId };
}

/**
 * Organizations this user created and has not deleted. Only the first one a
 * user creates carries the free allowance (see onboarding.service.ts). One
 * pending deletion does not count, so deleting your only workspace and
 * starting over keeps the free tier; cancelOrganizationDeletion takes the
 * allowance back from the restored one if a newer org got it meanwhile.
 */
export function countOwnedOrganizations(
  deps: ServiceDeps,
  userId: string
): Promise<number> {
  return deps.db.organization.count({
    where: { createdByUserId: userId, deleteAt: null },
  });
}

export async function getOrganizationBillingEventsCount(
  deps: ServiceDeps,
  organization: IServiceOrganization & { projects: { id: string }[] },
  now: Date = new Date()
): Promise<number | undefined> {
  // Paid plans use the Polar billing period. Free-tier organizations (and
  // paused ones, held to free limits) run on the calendar month in UTC: the
  // free event limit per month, resetting on the 1st. An org that dropped from
  // paid to free keeps its old Polar period columns, so the state decides, not
  // whether the period columns are null; otherwise it would be metered against
  // a window that grows every month.
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
  );
  const onCalendarMonth = ['free', 'paused'].includes(
    getSubscriptionState(organization)
  );
  const periodStart = onCalendarMonth
    ? monthStart
    : (organization.subscriptionCurrentPeriodStart ?? monthStart);
  const periodEnd = onCalendarMonth
    ? monthEnd
    : (organization.subscriptionCurrentPeriodEnd ?? monthEnd);

  if (!(periodStart && periodEnd) || organization.projects.length === 0) {
    return 0;
  }
  // The free hard cap meters by ingestion time: an event back-dated into an
  // earlier month (server SDKs, offline queues, `__timestamp`) is still
  // stored this month, and counting it by created_at would never cap it.
  const meteredAt = onCalendarMonth ? 'inserted_at' : 'created_at';

  const statement = sql`
    SELECT COUNT(*) AS count
    FROM ${sql.id(TABLE_NAMES.events)} e
    WHERE project_id IN ${sql.array(
      'String',
      organization.projects.map((project) => project.id)
    )}
      AND ${sql.id(meteredAt)} BETWEEN ${sql.string(formatClickhouseDate(periodStart))} AND ${sql.string(formatClickhouseDate(periodEnd))}
      AND name NOT IN ${sql.array('String', NON_BILLABLE_EVENT_NAMES)}
  `;

  const res = await chQuery<{ count: number }>(deps, statement);
  return res[0]?.count;
}

// Lifetime event count for a set of projects (excluding session bookkeeping
// events). The onboarding emails use this instead of subscriptionPeriodEventsCount,
// which only refreshes when sessions end.
export async function getOrganizationEventsCount(
  deps: ServiceDeps,
  projectIds: string[]
): Promise<number> {
  if (projectIds.length === 0) {
    return 0;
  }

  const statement = sql`
    SELECT COUNT(*) AS count
    FROM ${sql.id(TABLE_NAMES.events)} e
    WHERE project_id IN ${sql.array('String', projectIds)}
      AND name NOT IN ${sql.array('String', NON_BILLABLE_EVENT_NAMES)}
  `;

  const res = await chQuery<{ count: number }>(deps, statement);
  return res[0]?.count ?? 0;
}

// Events in a recent window, for organizations whose trial lapsed but whose
// SDKs never stopped. The lifetime count above says "you once used this"; this
// one says "you are using this right now", which is the only number that
// actually argues for a subscription.
export async function getOrganizationEventsCountSince(
  deps: ServiceDeps,
  projectIds: string[],
  since: Date
): Promise<number> {
  if (projectIds.length === 0) {
    return 0;
  }

  const statement = sql`
    SELECT COUNT(*) AS count
    FROM ${sql.id(TABLE_NAMES.events)} e
    WHERE project_id IN ${sql.array('String', projectIds)}
      AND name NOT IN ${sql.array('String', NON_BILLABLE_EVENT_NAMES)}
      AND created_at >= ${sql.string(formatClickhouseDate(since, true))}
  `;

  const res = await chQuery<{ count: number }>(deps, statement);
  return res[0]?.count ?? 0;
}

export interface IOrganizationBillingUsageInput {
  projectIds: string[];
  /** Inclusive UTC day, `YYYY-MM-DD`. */
  from: string;
  /** Inclusive UTC day, `YYYY-MM-DD`. */
  to: string;
  /** Exact lower bound within `from`, `YYYY-MM-DD HH:mm:ss` UTC, when the window starts mid-day. */
  since?: string;
}

export interface IOrganizationBillingUsage {
  from: string;
  to: string;
  /** One row per UTC day in the window, zero-filled; `counts` is keyed by project id. */
  days: { day: string; counts: Record<string, number> }[];
  /** Billable events per project over the window. */
  projectTotals: Record<string, number>;
  /** The most frequent billable event names over the window, descending. */
  eventNames: { name: string; count: number }[];
  /** The same per project, keyed by project id. */
  eventNamesByProject: Record<string, { name: string; count: number }[]>;
}

// Enough slices for a legible pie; the dashboard folds the rest into "Other".
export const BILLING_USAGE_EVENT_NAMES_LIMIT = 9;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function listUtcDays(from: string, to: string): string[] {
  const days: string[] = [];
  const end = new Date(`${to}T00:00:00.000Z`).getTime();
  for (
    let cursor = new Date(`${from}T00:00:00.000Z`).getTime();
    cursor <= end;
    cursor += MS_PER_DAY
  ) {
    days.push(new Date(cursor).toISOString().slice(0, 10));
  }
  return days;
}

export async function getOrganizationBillingUsage(
  deps: ServiceDeps,
  { projectIds, from, to, since }: IOrganizationBillingUsageInput
): Promise<IOrganizationBillingUsage> {
  const empty: IOrganizationBillingUsage = {
    from,
    to,
    days: listUtcDays(from, to).map((day) => ({ day, counts: {} })),
    projectTotals: {},
    eventNames: [],
    eventNamesByProject: {},
  };
  if (projectIds.length === 0) {
    return empty;
  }

  // Both statements share the billable-event filter so the pie's "Other"
  // slice (total minus the named slices) adds up against the bars.
  const billable = sql`
    project_id IN ${sql.array('String', projectIds)}
      AND toDate(created_at) BETWEEN toDate(${sql.string(from)}) AND toDate(${sql.string(to)})
      ${since ? sql`AND created_at >= ${sql.string(since)}` : sql.empty}
      AND name NOT IN ${sql.array('String', NON_BILLABLE_EVENT_NAMES)}
  `;
  const [perProjectDay, perName, perProjectName] = await Promise.all([
    chQuery<{ project_id: string; day: string; count: number }>(
      deps,
      sql`
        SELECT project_id, toDate(created_at) AS day, COUNT(*) AS count
        FROM ${sql.id(TABLE_NAMES.events)}
        WHERE ${billable}
        GROUP BY project_id, day
      `
    ),
    chQuery<{ name: string; count: number }>(
      deps,
      sql`
        SELECT name, COUNT(*) AS count
        FROM ${sql.id(TABLE_NAMES.events)}
        WHERE ${billable}
        GROUP BY name
        ORDER BY count DESC
        LIMIT ${sql.uint64(BILLING_USAGE_EVENT_NAMES_LIMIT)}
      `
    ),
    chQuery<{ project_id: string; name: string; count: number }>(
      deps,
      sql`
        SELECT project_id, name, COUNT(*) AS count
        FROM ${sql.id(TABLE_NAMES.events)}
        WHERE ${billable}
        GROUP BY project_id, name
        ORDER BY project_id, count DESC
        LIMIT ${sql.uint64(BILLING_USAGE_EVENT_NAMES_LIMIT)} BY project_id
      `
    ),
  ]);

  const countsByDay = new Map(empty.days.map((row) => [row.day, row.counts]));
  for (const row of perProjectDay) {
    const count = Number(row.count);
    countsByDay.get(row.day)![row.project_id] = count;
    empty.projectTotals[row.project_id] =
      (empty.projectTotals[row.project_id] ?? 0) + count;
  }
  empty.eventNames = perName.map((row) => ({
    name: row.name,
    count: Number(row.count),
  }));
  for (const row of perProjectName) {
    const names = empty.eventNamesByProject[row.project_id] ?? [];
    names.push({ name: row.name, count: Number(row.count) });
    empty.eventNamesByProject[row.project_id] = names;
  }
  return empty;
}

const BILLING_USAGE_CACHE_TTL_SEC = 60 * 10;
export const getOrganizationBillingUsageCached = cacheablePerDeps(
  'getOrganizationBillingUsage',
  (deps: ServiceDeps, input: IOrganizationBillingUsageInput) =>
    getOrganizationBillingUsage(deps, input),
  BILLING_USAGE_CACHE_TTL_SEC
);

export async function getOrganizationSubscriptionChartEndDate(
  deps: ServiceDeps,
  projectId: string,
  endDate: string
): Promise<string | null> {
  const organization = await getOrganizationByProjectIdCached(deps, projectId);
  if (!organization) {
    return null;
  }
  if (
    organization.subscriptionChartEndDate &&
    new Date(endDate) > organization.subscriptionChartEndDate
  ) {
    return DateTime.fromJSDate(organization.subscriptionChartEndDate)
      .setZone(organization.timezone || DEFAULT_TIMEZONE)
      .toFormat('yyyy-MM-dd HH:mm:ss');
  }

  return endDate;
}

export async function getSettingsForOrganization(
  deps: ServiceDeps,
  organizationId: string
): Promise<{ timezone: string }> {
  const db = deps.db;
  const organization = await db.organization.findUniqueOrThrow({
    where: {
      id: organizationId,
    },
  });

  return {
    timezone: resolveTimezone(deps, organization.id, organization.timezone),
  };
}

// One bad stored zone must not take the whole organization down.
function resolveTimezone(
  deps: ServiceDeps,
  organizationId: string,
  stored: string | null
): string {
  if (!stored) {
    return DEFAULT_TIMEZONE;
  }
  if (isValidTimezone(stored)) {
    return stored;
  }
  deps.logger.warn(
    { organizationId, timezone: stored },
    'organization has an invalid timezone; using UTC'
  );
  return DEFAULT_TIMEZONE;
}

export async function getSettingsForProject(
  deps: ServiceDeps,
  projectId: string
): Promise<{ timezone: string }> {
  const db = deps.db;
  const project = await db.project.findUniqueOrThrow({
    where: {
      id: projectId,
    },
    include: {
      organization: true,
    },
  });

  return {
    timezone: resolveTimezone(
      deps,
      project.organization.id,
      project.organization.timezone
    ),
  };
}

export async function deleteOrganization(
  deps: ServiceDeps,
  organizationId: string
) {
  const db = deps.db;
  return db.organization.delete({
    where: {
      id: organizationId,
    },
  });
}

export async function deleteProjects(deps: ServiceDeps, projectIds: string[]) {
  const db = deps.db;
  const projects = await db.project.findMany({
    where: {
      id: {
        in: projectIds,
      },
    },
  });

  if (projects.length === 0) {
    return;
  }

  await db.project.deleteMany({
    where: {
      id: {
        in: projects.map((project) => project.id),
      },
    },
  });

  return projects;
}

export async function deleteFromClickhouse(
  deps: ServiceDeps,
  projectIds: string[]
) {
  const ch = deps.ch;
  const where = sql`project_id IN ${sql.array('String', projectIds)}`;
  const tables = [
    TABLE_NAMES.events,
    TABLE_NAMES.profiles,
    TABLE_NAMES.events_bots,
    TABLE_NAMES.sessions,
    TABLE_NAMES.cohort_events_mv,
    TABLE_NAMES.dau_mv,
    TABLE_NAMES.event_names_mv,
    TABLE_NAMES.event_property_values_mv,
    TABLE_NAMES.cohort_members,
    TABLE_NAMES.cohort_metadata,
    TABLE_NAMES.event_profile_summary_mv,
    TABLE_NAMES.event_property_profile_summary_mv,
    TABLE_NAMES.ai_events,
    TABLE_NAMES.groups,
    TABLE_NAMES.alias,
  ];

  for (const table of tables) {
    const target = replicatedTarget(deps.config.clickhouseClustered, table);
    // If materialized view, use ALTER TABLE since DELETE is not supported
    const statement = table.endsWith('_mv')
      ? sql`ALTER TABLE ${target} DELETE WHERE ${where};`
      : sql`DELETE FROM ${target} WHERE ${where};`;

    const { query, query_params } = statement.toStatement();
    await ch.command({
      query,
      query_params,
      clickhouse_settings: {
        lightweight_deletes_sync: '0',
      },
    });
  }
}

export interface DeleteCronResult {
  organizations: number;
  projects: number;
}

/**
 * Finds organizations scheduled for deletion or orphaned (no admin member),
 * and projects individually scheduled for deletion, then sweeps both out of
 * ClickHouse and Postgres in one pass.
 */
export async function runDeleteCron(
  deps: ServiceDeps
): Promise<DeleteCronResult> {
  const db = deps.db;
  const now = new Date();

  const organizations = await db.organization.findMany({
    where: {
      OR: [
        { deleteAt: { lte: now } },
        { members: { none: { role: { in: STORED_ADMIN_ROLES } } } },
      ],
    },
    include: { projects: { select: { id: true } } },
  });

  // Skip paying organizations
  const deletableOrganizations = organizations.filter(
    (organization) =>
      !(organization.hasSubscription && !organization.isWillBeCanceled)
  );

  const scheduledProjects = await db.project.findMany({
    where: { deleteAt: { lte: now } },
    select: { id: true },
  });

  const projectIds = [
    ...new Set([
      ...deletableOrganizations.flatMap((organization) =>
        organization.projects.map((project) => project.id)
      ),
      ...scheduledProjects.map((project) => project.id),
    ]),
  ];

  if (projectIds.length > 0) {
    await deleteFromClickhouse(deps, projectIds);
    await deleteProjects(deps, projectIds);
  }

  for (const organization of deletableOrganizations) {
    await deleteOrganization(deps, organization.id);
  }

  return {
    organizations: deletableOrganizations.length,
    projects: projectIds.length,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Privytics retention by plan. These back the promises in the Terms, the
 * Privacy Policy and the marketing pages, so changing them means changing
 * those documents too: free 12 months, any paid state 5 years.
 */
export const FREE_RETENTION_DAYS = 365;
export const PAID_RETENTION_DAYS = 365 * 5;

/**
 * Per-project time-series tables with the timestamp column each one uses
 * (`session_replay_chunks` has no `created_at`), including the per-event and
 * per-profile aggregates that materialized views keep after `events` rows go.
 * `day` columns are a Date or a start-of-day DateTime: they are compared with
 * the cutoff's date (a Date refuses a time), which keeps the boundary day.
 * Profiles, aliases and groups are identity records, not time series, and are
 * deliberately kept.
 */
const RETAINED_TABLES: { table: string; column: string; day?: true }[] = [
  { table: TABLE_NAMES.events, column: 'created_at' },
  { table: TABLE_NAMES.sessions, column: 'created_at' },
  { table: TABLE_NAMES.session_replay_chunks, column: 'started_at' },
  { table: TABLE_NAMES.events_bots, column: 'created_at' },
  { table: TABLE_NAMES.ai_events, column: 'created_at' },
  { table: TABLE_NAMES.cohort_events_mv, column: 'created_at', day: true },
  { table: TABLE_NAMES.dau_mv, column: 'date', day: true },
  {
    table: TABLE_NAMES.event_profile_summary_mv,
    column: 'event_date',
    day: true,
  },
  {
    table: TABLE_NAMES.event_property_profile_summary_mv,
    column: 'event_date',
    day: true,
  },
];

/**
 * Deletion cannot be undone, so the 12-month cutoff needs both a stored status
 * that says free (a webhook-confirmed downgrade, or never paid) and the state
 * machine agreeing. Anything else, including a paid row the clock alone reads
 * as lapsed (a late renewal webhook), keeps the paid 5 years.
 */
function onFreeRetention(
  organization: Parameters<typeof getSubscriptionState>[0]
): boolean {
  const status = organization.subscriptionStatus;
  return (
    (status === 'free' || status === null) &&
    getSubscriptionState(organization) === 'free'
  );
}

export interface DataRetentionCronResult {
  organizationsSwept: number;
  mutationsIssued: number;
}

/**
 * Enforces per-organization retention. ClickHouse TTLs cannot express it (it
 * depends on the plan, not the table), so this issues one asynchronous
 * mutation per table per organization; ClickHouse applies them in the
 * background. Self-hosters own their data, so it never runs there.
 */
export async function runDataRetentionCron(
  deps: ServiceDeps
): Promise<DataRetentionCronResult | null> {
  if (deps.config.selfHosted) {
    return null;
  }

  const organizations = await deps.db.organization.findMany({
    select: {
      id: true,
      subscriptionStatus: true,
      subscriptionCanceledAt: true,
      subscriptionEndsAt: true,
      subscriptionPauseAtPeriodEnd: true,
      projects: { where: { deleteAt: null }, select: { id: true } },
    },
  });

  let organizationsSwept = 0;
  let mutationsIssued = 0;
  for (const organization of organizations) {
    const projectIds = organization.projects.map((project) => project.id);
    if (projectIds.length === 0) {
      continue;
    }
    const retentionDays = onFreeRetention(organization)
      ? FREE_RETENTION_DAYS
      : PAID_RETENTION_DAYS;
    const cutoff = new Date(Date.now() - retentionDays * DAY_MS);

    for (const { table, column, day } of RETAINED_TABLES) {
      const statement = sql`ALTER TABLE ${replicatedTarget(deps.config.clickhouseClustered, table)} DELETE WHERE project_id IN ${sql.array('String', projectIds)} AND ${sql.id(column)} < ${sql.string(formatClickhouseDate(cutoff, day))}`;
      try {
        await deps.ch.command(statement.toStatement());
        mutationsIssued++;
      } catch (error) {
        // One bad table must not stop the sweep for every other organization.
        deps.logger.error(
          { err: error, organizationId: organization.id, table },
          'Retention mutation failed'
        );
      }
    }
    organizationsSwept++;
  }

  return { organizationsSwept, mutationsIssued };
}

export async function updateOrganization(
  deps: ServiceDeps,
  input: {
    id: string;
    name: string;
    timezone: string;
  }
) {
  const db = deps.db;
  return db.organization.update({
    where: {
      id: input.id,
    },
    data: {
      name: input.name,
      timezone: input.timezone,
    },
  });
}

/**
 * Schedule the organization and all of its projects for deletion in 24
 * hours (cancelable until then). The hourly `delete` cron removes the
 * projects (and their ClickHouse events) and the organization in a single
 * pass once their `deleteAt` has passed.
 */
export async function scheduleOrganizationDeletion(
  deps: ServiceDeps,
  organizationId: string
): Promise<void> {
  const db = deps.db;
  const organization = await getOrganizationById(deps, organizationId);

  // Require billing to be cancelled first. We don't want to delete an
  // organization that still has a live paid subscription. Once the user has
  // cancelled (the subscription is scheduled to end), deletion is allowed.
  if (organization.hasSubscription && !organization.isWillBeCanceled) {
    throw new TRPCBadRequestError(
      'Please cancel your subscription before deleting this organization.'
    );
  }

  const deleteAt = new Date(Date.now() + DELETE_GRACE_PERIOD_MS);
  await db.$transaction([
    // Projects already being deleted keep their own deleteAt, so cancelling
    // the organization's deletion does not bring them back (that would let a
    // free organization end up with more than one project).
    db.project.updateMany({
      where: {
        organizationId,
        deleteAt: null,
      },
      data: {
        deleteAt,
      },
    }),
    db.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        deleteAt,
      },
    }),
  ]);
}

export async function cancelOrganizationDeletion(
  deps: ServiceDeps,
  organizationId: string
): Promise<void> {
  const db = deps.db;
  // Restore only the projects scheduled together with the organization.
  const organization = await db.organization.findUniqueOrThrow({
    where: { id: organizationId },
    select: {
      deleteAt: true,
      createdByUserId: true,
      subscriptionState: true,
    },
  });
  // Privytics: while this org was pending deletion it did not count as owned,
  // so a workspace created since may hold the free allowance. Then this one
  // comes back without it, or one account would keep two free orgs.
  const { deleteAt, createdByUserId } = organization;
  const hasNewerFreeOrganization =
    deleteAt !== null &&
    createdByUserId !== null &&
    organization.subscriptionState === 'free' &&
    (await db.organization.count({
      where: {
        createdByUserId,
        deleteAt: null,
        id: { not: organizationId },
        subscriptionPeriodEventsLimit: { gt: 0 },
        createdAt: {
          gt: new Date(deleteAt.getTime() - DELETE_GRACE_PERIOD_MS),
        },
      },
    })) > 0;
  await db.$transaction([
    db.project.updateMany({
      where: {
        organizationId,
        deleteAt: organization.deleteAt,
      },
      data: {
        deleteAt: null,
      },
    }),
    db.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        deleteAt: null,
        ...(hasNewerFreeOrganization
          ? { subscriptionPeriodEventsLimit: 0 }
          : {}),
      },
    }),
  ]);
}

export type InviteUserResult =
  | {
      type: 'is_member';
      member: Awaited<ReturnType<typeof connectUserToOrganization>>;
    }
  | {
      type: 'is_invited';
      invite: Invite & { organization: { name: string } };
    };

export async function inviteUserToOrganization(
  deps: ServiceDeps,
  input: {
    organizationId: string;
    email: string;
    role: InvitableRole;
    projectScope: ProjectScope;
    access: IProjectAccessGrant[];
    invitedById: string;
  }
): Promise<InviteUserResult> {
  const db = deps.db;
  const email = input.email.toLowerCase();
  const userExists = await db.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: 'insensitive',
      },
    },
  });

  const alreadyMember = await db.member.findFirst({
    where: {
      userId: userExists?.id,
      organizationId: input.organizationId,
    },
  });

  if (alreadyMember && userExists) {
    throw new TRPCBadRequestError(
      'User is already a member of the organization'
    );
  }

  const alreadyInvited = await db.invite.findFirst({
    where: {
      email,
      organizationId: input.organizationId,
    },
  });

  if (alreadyInvited) {
    throw new TRPCBadRequestError(
      'User is already invited to the organization'
    );
  }

  const access = input.projectScope === 'all' ? [] : input.access;
  await assertProjectsInOrganization(deps, input.organizationId, access);

  const invite = await db.invite.create({
    data: {
      id: generateSecureId('invite'),
      email,
      organizationId: input.organizationId,
      role: input.role,
      createdById: input.invitedById,
      projectScope: input.projectScope,
      projectAccess: access,
      expiresAt: new Date(Date.now() + INVITE_EXPIRY_MS),
    },
    include: {
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  // Only a verified address may join without the link: anyone can register
  // an unverified account under someone else's email.
  if (userExists?.emailVerified) {
    const member = await connectUserToOrganization(deps, {
      user: userExists,
      inviteId: invite.id,
    });

    return {
      type: 'is_member',
      member,
    };
  }

  await sendEmail('invite', {
    to: email,
    data: {
      url: `${deps.config.dashboardUrl}/onboarding?inviteId=${invite.id}`,
      organizationName: invite.organization.name,
    },
  });

  return {
    type: 'is_invited',
    invite,
  };
}

export async function getInviteOrThrow(
  deps: ServiceDeps,
  inviteId: string
): Promise<Invite> {
  const db = deps.db;
  return db.invite.findUniqueOrThrow({
    where: {
      id: inviteId,
    },
  });
}

export async function revokeInvite(
  deps: ServiceDeps,
  inviteId: string
): Promise<Invite> {
  const db = deps.db;
  return db.invite.delete({
    where: {
      id: inviteId,
    },
  });
}

export async function removeOrganizationMember(
  deps: ServiceDeps,
  input: {
    organizationId: string;
    memberId: string;
    targetUserId: string;
    requestedByUserId: string;
  }
): Promise<void> {
  const db = deps.db;
  const exists = await db.member.count({
    where: {
      userId: input.targetUserId,
      organizationId: input.organizationId,
    },
  });

  if (input.requestedByUserId === input.targetUserId && exists === 1) {
    throw new Error('You cannot remove yourself from the organization');
  }

  await db.member.delete({
    where: {
      id: input.memberId,
      userId: input.targetUserId,
      organizationId: input.organizationId,
    },
  });
  await clearMemberAccessCache(deps, {
    userId: input.targetUserId,
    organizationId: input.organizationId,
  });
}

/**
 * A grant may only name a project inside the organization it is granted in.
 * Without this an admin of one organization could grant access to another
 * organization's projects.
 */
async function assertProjectsInOrganization(
  deps: ServiceDeps,
  organizationId: string,
  access: { projectId: string }[]
) {
  const projectIds = [...new Set(access.map((grant) => grant.projectId))];
  if (projectIds.length === 0) {
    return;
  }
  const found = await deps.db.project.findMany({
    where: { id: { in: projectIds }, organizationId },
    select: { id: true },
  });
  if (found.length !== projectIds.length) {
    const known = new Set(found.map((project) => project.id));
    const unknown = projectIds.filter((id) => !known.has(id));
    throw new TRPCBadRequestError(
      `Project not in this organization: ${unknown.join(', ')}`
    );
  }
}

export async function updateOrganizationMemberAccess(
  deps: ServiceDeps,
  input: {
    organizationId: string;
    targetUserId: string;
    projectScope: ProjectScope;
    access: IProjectAccessGrant[];
  }
): Promise<void> {
  const db = deps.db;

  // The rows below are keyed on a user this never confirmed was a member, so
  // an unknown id silently produced access rows for a non-member.
  const member = await db.member.findFirst({
    where: {
      userId: input.targetUserId,
      organizationId: input.organizationId,
    },
    select: { id: true },
  });
  if (!member) {
    throw new TRPCNotFoundError('User is not a member of this organization');
  }
  const access = input.projectScope === 'all' ? [] : input.access;
  await assertProjectsInOrganization(deps, input.organizationId, access);

  await db.$transaction(
    writeMemberProjects(deps, member.id, input.projectScope, access)
  );
  await clearMemberAccessCache(deps, {
    userId: input.targetUserId,
    organizationId: input.organizationId,
  });
}

export function createOrganizationService(
  deps: ServiceDeps,
  _services: () => Services
) {
  return {
    get: (organizationId: string): ReturnType<typeof getOrganizationById> =>
      getOrganizationById(deps, organizationId),
    list: (userId: string | null): ReturnType<typeof getOrganizations> =>
      getOrganizations(deps, userId),
    countOwned: (userId: string): Promise<number> =>
      countOwnedOrganizations(deps, userId),
    update: (input: {
      id: string;
      name: string;
      timezone: string;
    }): ReturnType<typeof updateOrganization> =>
      updateOrganization(deps, input),
    scheduleDeletion: (organizationId: string): Promise<void> =>
      scheduleOrganizationDeletion(deps, organizationId),
    cancelDeletion: (organizationId: string): Promise<void> =>
      cancelOrganizationDeletion(deps, organizationId),
    inviteUser: (
      input: Parameters<typeof inviteUserToOrganization>[1]
    ): Promise<InviteUserResult> => inviteUserToOrganization(deps, input),
    getInviteOrThrow: (inviteId: string): Promise<Invite> =>
      getInviteOrThrow(deps, inviteId),
    revokeInvite: (inviteId: string): Promise<Invite> =>
      revokeInvite(deps, inviteId),
    removeMember: (
      input: Parameters<typeof removeOrganizationMember>[1]
    ): Promise<void> => removeOrganizationMember(deps, input),
    updateMemberAccess: (
      input: Parameters<typeof updateOrganizationMemberAccess>[1]
    ): Promise<void> => updateOrganizationMemberAccess(deps, input),
    members: (organizationId: string): Promise<IServiceMember[]> =>
      getMembers(deps, organizationId),
    invitations: (organizationId: string): Promise<IServiceInvite[]> =>
      getInvites(deps, organizationId),
    getInvite: (inviteId: string): ReturnType<typeof getInviteById> =>
      getInviteById(deps, inviteId),
    acceptInvite: (input: {
      userId: string;
      inviteId: string;
    }): Promise<{ organizationId: string }> => acceptInvite(deps, input),
    runDeleteCron: (): Promise<DeleteCronResult> => runDeleteCron(deps),
    runDataRetentionCron: (): Promise<DataRetentionCronResult | null> =>
      runDataRetentionCron(deps),
  };
}
