// Privytics: the hourly free-usage refresh (the free hard cap must engage for
// traffic that never ends a session) and the single clock updateEventsCount
// uses across a month boundary. Postgres and ClickHouse are fakes on `deps`.

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  expect,
  mock,
  setSystemTime,
  test,
} from 'bun:test';
import { testCoreConfig } from '../../../../test/config-fixture';
import { recordingLogger } from '../../../../test/service-deps';
import type { ServiceDeps } from '../../../services';

function cacheableStub(
  fnOrName: ((...args: unknown[]) => unknown) | string,
  fnOrTtl: ((...args: unknown[]) => unknown) | number
) {
  const fn =
    typeof fnOrName === 'function'
      ? fnOrName
      : (fnOrTtl as (...args: unknown[]) => unknown);
  return Object.assign(fn, {
    getKey: () => '',
    clear: async () => 0,
    set: () => async () => 'OK' as const,
  });
}
// Snapshot restore, as in the other suites that stub `cacheable`.
const realRedis = { ...(await import('@openpanel/redis')) };
mock.module('@openpanel/redis', () => ({
  ...realRedis,
  cacheable: cacheableStub,
}));
const realEmail = { ...(await import('../../../clients/email')) };
mock.module('../../../clients/email', () => ({
  ...realEmail,
  sendEmail: async () => undefined,
}));

// test/preload.ts pins SELF_HOSTED=true, under which every org is
// 'self_hosted'; this file exercises the cloud states.
const preloadSelfHosted = process.env.SELF_HOSTED;
let subject: typeof import('./usage');
beforeAll(async () => {
  process.env.SELF_HOSTED = 'false';
  subject = await import('./usage');
});
afterAll(() => {
  process.env.SELF_HOSTED = preloadSelfHosted;
  mock.module('@openpanel/redis', () => realRedis);
  mock.module('../../../clients/email', () => realEmail);
});

const orgByProject = new Map<string, Record<string, unknown>>();
const refreshedProjects: string[] = [];
const orgUpdates: Record<string, unknown>[] = [];
const chQueries: { query: string; query_params?: Record<string, unknown> }[] =
  [];
let cronOrganizations: Record<string, unknown>[] = [];
let onBillingCount: () => void = () => undefined;

const findMany = mock(async (_args: unknown) => cronOrganizations);
const db = {
  organization: {
    findMany,
    findFirst: mock(
      async ({ where }: { where: { projects: { some: { id: string } } } }) => {
        const projectId = where.projects.some.id;
        refreshedProjects.push(projectId);
        if (projectId === 'proj_broken') {
          throw new Error('boom');
        }
        return orgByProject.get(projectId) ?? null;
      }
    ),
    update: mock(async ({ data }: { data: Record<string, unknown> }) => {
      orgUpdates.push(data);
    }),
    updateMany: mock(async () => ({ count: 0 })),
  },
  project: { update: mock(async () => undefined) },
};
const ch = {
  query: mock(
    async (args: { query: string; query_params?: Record<string, unknown> }) => {
      chQueries.push(args);
      if (args.query.includes('BETWEEN')) {
        onBillingCount();
      }
      return {
        json: async () => ({ data: [{ count: 10_400 }], meta: [] }),
      };
    }
  ),
};
function makeDeps(selfHosted = false) {
  return {
    db,
    ch,
    logger: recordingLogger(),
    config: testCoreConfig({ selfHosted }),
  } as unknown as ServiceDeps;
}

beforeEach(() => {
  orgByProject.clear();
  refreshedProjects.length = 0;
  orgUpdates.length = 0;
  chQueries.length = 0;
  cronOrganizations = [];
  onBillingCount = () => undefined;
  findMany.mockClear();
});
afterEach(() => {
  setSystemTime();
});

const FREE = {
  subscriptionStatus: 'free',
  subscriptionCanceledAt: null,
  subscriptionEndsAt: null,
  subscriptionPauseAtPeriodEnd: false,
};

test('refreshFreeUsage refreshes every org on free limits, one failure at a time', async () => {
  cronOrganizations = [
    { id: 'org_free', ...FREE, projects: [{ id: 'proj_free' }] },
    {
      id: 'org_paused',
      ...FREE,
      subscriptionStatus: 'paused',
      projects: [{ id: 'proj_paused' }],
    },
    // The comped production org: active with no end date.
    {
      id: 'privytics',
      ...FREE,
      subscriptionStatus: 'active',
      projects: [{ id: 'proj_comped' }],
    },
    {
      id: 'org_paid',
      ...FREE,
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date('2099-01-01T00:00:00Z'),
      projects: [{ id: 'proj_paid' }],
    },
    { id: 'org_broken', ...FREE, projects: [{ id: 'proj_broken' }] },
    { id: 'org_free_2', ...FREE, projects: [{ id: 'proj_free_2' }] },
  ];

  const result = await subject.refreshFreeUsage(makeDeps());

  expect(findMany.mock.calls[0]?.[0]).toMatchObject({
    where: {
      deleteAt: null,
      subscriptionPeriodEventsLimit: { gt: 0 },
      projects: { some: {} },
    },
  });
  expect(refreshedProjects).toEqual([
    'proj_free',
    'proj_paused',
    'proj_broken',
    'proj_free_2',
  ]);
  expect(result).toEqual({ refreshed: 3, failed: 1 });
});

test('refreshFreeUsage is off on self-hosted installs', async () => {
  expect(await subject.refreshFreeUsage(makeDeps(true))).toBeNull();
  expect(findMany).not.toHaveBeenCalled();
});

test('a count of last month finishing after midnight is stamped in last month', async () => {
  const before = new Date('2026-10-31T23:59:59.800Z');
  setSystemTime(before);
  onBillingCount = () => setSystemTime(new Date('2026-11-01T00:00:00.200Z'));
  orgByProject.set('proj_1', {
    id: 'org_1',
    name: 'Acme',
    ...FREE,
    subscriptionPeriodEventsLimit: 10_000,
    subscriptionPeriodEventsCountExceededAt: null,
    usageExceededSentAt: null,
    usageWarningSentAt: null,
    projects: [{ id: 'proj_1' }],
  });

  await subject.updateEventsCount(makeDeps(), 'proj_1');

  const billing = chQueries.find((call) => call.query.includes('BETWEEN'));
  expect(Object.values(billing?.query_params ?? {})).toContain(
    '2026-10-01 00:00:00'
  );
  // Stamped in October, so November's hard cap does not start blocked.
  expect(orgUpdates[0]?.subscriptionPeriodEventsCountExceededAt).toEqual(
    before
  );
});
