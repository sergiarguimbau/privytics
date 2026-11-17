// The subject is built over a fake `ServiceDeps`, so `deps.db` IS the fake below and
// Postgres needs no module mock. The ClickHouse readers (`getProjectEventsCount`,
// `getLastEventPerProject`) are not covered here.
//
// Create/update invalidate a project's clients through `client.service.ts`'s
// module-scope `getClientByIdCached`, built from the `cacheable` stub below.

import { afterAll, beforeAll, beforeEach, expect, mock, test } from 'bun:test';
import { testServices } from '../../../test/service-deps';

interface FakeProject {
  id: string;
  organizationId: string;
  name: string;
  domain: string | null;
  cors: string[];
  crossDomain: boolean;
  allowUnsafeRevenueTracking: boolean;
  types: string[];
  filters: unknown[];
  eventsCount: number;
  firstEventAt: Date | null;
  createdAt: Date;
  deleteAt: Date | null;
}

interface FakeClient {
  id: string;
  projectId: string;
}

const projectStore = new Map<string, FakeProject>();
const clientsByProject = new Map<string, FakeClient[]>();
const reportCountByProject = new Map<string, number>();
const memberCountByOrg = new Map<string, number>();
const organizationDeleteAtById = new Map<string, Date | null>();
// Privytics free plan: one project. Organizations default to a paid state.
const subscriptionStateByOrg = new Map<string, string>();

function makeProject(
  overrides: Partial<FakeProject> & { id: string; organizationId: string }
): FakeProject {
  return {
    name: 'A project',
    domain: null,
    cors: [],
    crossDomain: false,
    allowUnsafeRevenueTracking: false,
    types: [],
    filters: [],
    eventsCount: 0,
    firstEventAt: null,
    createdAt: new Date(),
    deleteAt: null,
    ...overrides,
  };
}

const project = {
  findMany: mock(
    async ({ where }: { where: { organizationId: string; deleteAt?: null } }) =>
      [...projectStore.values()].filter(
        (p) => p.organizationId === where.organizationId && !p.deleteAt
      )
  ),
  findFirst: mock(
    async ({ where }: { where: { id: string; organizationId: string } }) => {
      const found = projectStore.get(where.id);
      if (!found || found.organizationId !== where.organizationId) {
        return null;
      }
      return { ...found, clients: clientsByProject.get(where.id) ?? [] };
    }
  ),
  findUnique: mock(async ({ where: { id } }: { where: { id: string } }) => {
    const found = projectStore.get(id);
    if (!found) {
      return null;
    }
    return {
      ...found,
      organization: { deleteAt: organizationDeleteAtById.get(id) ?? null },
    };
  }),
  findUniqueOrThrow: mock(
    async ({ where: { id } }: { where: { id: string } }) => {
      const found = projectStore.get(id);
      if (!found) {
        throw new Error(`project ${id} not found`);
      }
      return {
        ...found,
        organization: { deleteAt: organizationDeleteAtById.get(id) ?? null },
      };
    }
  ),
  count: mock(
    async ({
      where,
    }: {
      where: {
        organizationId: string;
        deleteAt?: null;
        createdAt?: { gt: Date };
      };
    }) =>
      [...projectStore.values()].filter(
        (p) =>
          p.organizationId === where.organizationId &&
          !('deleteAt' in where && p.deleteAt) &&
          (!where.createdAt || p.createdAt > where.createdAt.gt)
      ).length
  ),
  create: mock(
    async ({
      data,
    }: {
      data: Omit<FakeProject, 'id' | 'createdAt'> & { id: string };
    }) => {
      const created = makeProject(data);
      projectStore.set(created.id, created);
      const client = { id: `client_${created.id}`, projectId: created.id };
      clientsByProject.set(created.id, [client]);
      return { ...created, clients: [{ id: client.id }] };
    }
  ),
  update: mock(
    async ({
      where: { id },
      data,
    }: {
      where: { id: string };
      data: Partial<FakeProject>;
    }) => {
      const existing = projectStore.get(id);
      if (!existing) {
        throw new Error(`project ${id} not found`);
      }
      const next = { ...existing, ...data };
      projectStore.set(id, next);
      return next;
    }
  ),
  updateMany: mock(
    async ({
      where: { id, deleteAt },
      data,
    }: {
      where: { id: string; deleteAt?: null };
      data: Partial<FakeProject>;
    }) => {
      const existing = projectStore.get(id);
      if (!existing || (deleteAt === null && existing.deleteAt)) {
        return { count: 0 };
      }
      projectStore.set(id, { ...existing, ...data });
      return { count: 1 };
    }
  ),
};

const organization = {
  findUniqueOrThrow: mock(async ({ where: { id } }: { where: { id: string } }) => ({
    subscriptionState: subscriptionStateByOrg.get(id) ?? 'active',
  })),
};

const report = {
  count: mock(
    async ({ where: { projectId } }: { where: { projectId: string } }) =>
      reportCountByProject.get(projectId) ?? 0
  ),
};

const member = {
  count: mock(
    async ({
      where: { organizationId },
    }: {
      where: { organizationId: string };
    }) => memberCountByOrg.get(organizationId) ?? 0
  ),
};

// Bypasses the Redis cache-aside: this module's own logic is exercised directly.
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
// Each factory spreads a plain-object SNAPSHOT of the real module and is
// restored in afterAll. `mock.module` has no per-file scope under bare `bun
// test`, and a partial factory for `@openpanel/redis` deletes every export it
// does not name for whichever file runs next.
const realRedis = { ...(await import('@openpanel/redis')) };
mock.module('@openpanel/redis', () => ({
  ...realRedis,
  cacheable: cacheableStub,
  getRedisCache: () => ({
    get: async () => null,
    setex: async () => undefined,
    del: async () => undefined,
  }),
}));

const realSlugId = { ...(await import('../../slug-id')) };
mock.module('../../slug-id', () => ({
  ...realSlugId,
  getId: async (_deps: unknown, _table: string, name: string) => `${name}-slug`,
}));

afterAll(() => {
  mock.module('@openpanel/redis', () => realRedis);
  mock.module('../../slug-id', () => realSlugId);
});

let subject: ReturnType<
  typeof import('./project.service').createProjectService
>;
let isFreeProjectLimitReached: typeof import('./project.service').isFreeProjectLimitReached;
let FREE_PLAN_PROJECT_LIMIT_MESSAGE: string;
const deps = () =>
  ({ db: { project, organization } }) as unknown as Parameters<
    typeof isFreeProjectLimitReached
  >[0];
beforeAll(async () => {
  const { createProjectService, ...rest } = await import('./project.service');
  ({ isFreeProjectLimitReached, FREE_PLAN_PROJECT_LIMIT_MESSAGE } = rest);
  subject = createProjectService(
    {
      db: { project, report, member, organization },
    } as unknown as import('../../services').ServiceDeps,
    testServices()
  );
});

beforeEach(() => {
  projectStore.clear();
  clientsByProject.clear();
  reportCountByProject.clear();
  memberCountByOrg.clear();
  organizationDeleteAtById.clear();
  subscriptionStateByOrg.clear();
});

test('listProjectsForOrganization excludes soft-deleted projects and other orgs', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));
  projectStore.set(
    'p2',
    makeProject({ id: 'p2', organizationId: 'org_1', deleteAt: new Date() })
  );
  projectStore.set('p3', makeProject({ id: 'p3', organizationId: 'org_2' }));

  const result = await subject.listProjectsForOrganization('org_1');
  expect(result.map((p) => p.id)).toEqual(['p1']);
});

test('getProjectForOrganization returns null for a project in a different org', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));

  const result = await subject.getProjectForOrganization('p1', 'org_2');
  expect(result).toBeNull();
});

test('createProjectForOrganization creates a project with a first write client', async () => {
  const result = await subject.createProjectForOrganization('org_1', {
    name: 'New project',
    cors: ['https://example.com'],
    crossDomain: false,
    types: [],
  });

  expect(result.project.organizationId).toBe('org_1');
  expect(result.client).not.toBeNull();
  expect(typeof result.client?.secret).toBe('string');
});

test('createProjectForOrganization allows the domain when no origins were given', async () => {
  const result = await subject.createProjectForOrganization('org_1', {
    name: 'Site',
    domain: 'https://example.com/',
    cors: [],
    crossDomain: false,
    types: ['website'],
  });

  expect(result.project.cors).toEqual(['https://example.com']);
});

test('createProjectForOrganization keeps explicit origins and adds none without a domain', async () => {
  const explicit = await subject.createProjectForOrganization('org_1', {
    name: 'Explicit',
    domain: 'https://example.com',
    cors: ['https://app.example.com/'],
    crossDomain: false,
    types: ['website'],
  });
  expect(explicit.project.cors).toEqual(['https://app.example.com']);

  const backend = await subject.createProjectForOrganization('org_1', {
    name: 'Backend',
    domain: null,
    cors: [],
    crossDomain: false,
    types: ['backend'],
  });
  expect(backend.project.cors).toEqual([]);
});

test('updateProjectForOrganization returns null for a project in a different org', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));

  const result = await subject.updateProjectForOrganization('p1', 'org_2', {
    name: 'Renamed',
  });
  expect(result).toBeNull();
});

test('updateProjectForOrganization strips trailing slashes from domain and cors', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));

  const result = await subject.updateProjectForOrganization('p1', 'org_1', {
    domain: 'https://example.com/',
    cors: ['https://a.com/', 'https://b.com/'],
  });

  expect(result?.domain).toBe('https://example.com');
  expect(result?.cors).toEqual(['https://a.com', 'https://b.com']);
});

test('updateProjectForOrganization persists exclude filters', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));
  const filters = [
    { type: 'ip' as const, ip: '203.0.113.7' },
    { type: 'profile_id' as const, profileId: 'usr_1' },
  ];

  const result = await subject.updateProjectForOrganization('p1', 'org_1', {
    filters,
  });

  expect(result?.filters).toEqual(filters);
  expect(projectStore.get('p1')?.filters).toEqual(filters);
});

test('updateProjectForOrganization leaves filters unchanged when omitted', async () => {
  const filters = [{ type: 'ip', ip: '203.0.113.7' }];
  projectStore.set(
    'p1',
    makeProject({ id: 'p1', organizationId: 'org_1', filters })
  );

  await subject.updateProjectForOrganization('p1', 'org_1', {
    name: 'Renamed',
  });

  expect(projectStore.get('p1')?.filters).toEqual(filters);
});

test('deleteProjectForOrganization schedules a 24h grace period, scoped to the org', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));

  const denied = await subject.deleteProjectForOrganization('p1', 'org_2');
  expect(denied).toBe(false);

  const before = Date.now();
  const result = await subject.deleteProjectForOrganization('p1', 'org_1');
  expect(result).toBe(true);

  const updated = projectStore.get('p1');
  expect(updated?.deleteAt).not.toBeNull();
  const deleteAtMs = updated?.deleteAt?.getTime() ?? 0;
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  expect(deleteAtMs).toBeGreaterThanOrEqual(before + TWENTY_FOUR_HOURS_MS);
});

test('scheduleProjectDeletion sets deleteAt ~24h out', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));

  const before = Date.now();
  await subject.scheduleProjectDeletion('p1');

  const updated = projectStore.get('p1');
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  expect(updated?.deleteAt?.getTime()).toBeGreaterThanOrEqual(
    before + TWENTY_FOUR_HOURS_MS
  );
});

test('cancelProjectDeletion refuses while the organization itself is scheduled for deletion', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));
  organizationDeleteAtById.set('p1', new Date());

  await expect(subject.cancelProjectDeletion('p1')).rejects.toThrow(
    /organization is scheduled for deletion/
  );
});

test('cancelProjectDeletion clears deleteAt otherwise', async () => {
  projectStore.set(
    'p1',
    makeProject({ id: 'p1', organizationId: 'org_1', deleteAt: new Date() })
  );

  await subject.cancelProjectDeletion('p1');
  expect(projectStore.get('p1')?.deleteAt).toBeNull();
});

test('getProjectActivationStatus reports hasReport/hasTeammate from counts', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));
  reportCountByProject.set('p1', 2);
  memberCountByOrg.set('org_1', 3);

  const status = await subject.getProjectActivationStatus('p1');
  expect(status.hasReport).toBe(true);
  expect(status.hasTeammate).toBe(true);
});

test('getProjectActivationStatus is false when there is no report and no extra teammate', async () => {
  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));
  memberCountByOrg.set('org_1', 1);

  const status = await subject.getProjectActivationStatus('p1');
  expect(status.hasReport).toBe(false);
  expect(status.hasTeammate).toBe(false);
});

test('free plan: the first project is allowed', async () => {
  subscriptionStateByOrg.set('org_1', 'free');

  const result = await subject.createProjectForOrganization('org_1', {
    name: 'First',
    cors: [],
    crossDomain: false,
    types: [],
  });
  expect(result.project.organizationId).toBe('org_1');
});

test('free plan: a second project is refused, ignoring ones pending deletion', async () => {
  subscriptionStateByOrg.set('org_1', 'free');
  projectStore.set(
    'gone',
    makeProject({ id: 'gone', organizationId: 'org_1', deleteAt: new Date() })
  );
  expect(await isFreeProjectLimitReached(deps(), 'org_1')).toBe(false);

  projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));
  await expect(
    subject.createProjectForOrganization('org_1', {
      name: 'Second',
      cors: [],
      crossDomain: false,
      types: [],
    })
  ).rejects.toThrow(FREE_PLAN_PROJECT_LIMIT_MESSAGE);
});

const HOUR_MS = 60 * 60 * 1000;

test('free plan: delete, create a new project, restore the old one is refused', async () => {
  subscriptionStateByOrg.set('org_1', 'free');
  // p2 was scheduled an hour ago (deleteAt is the 24h grace out); p1 came after.
  const scheduledAt = Date.now() - HOUR_MS;
  projectStore.set(
    'p2',
    makeProject({
      id: 'p2',
      organizationId: 'org_1',
      createdAt: new Date(scheduledAt - 30 * 24 * HOUR_MS),
      deleteAt: new Date(scheduledAt + 24 * HOUR_MS),
    })
  );
  projectStore.set(
    'p1',
    makeProject({
      id: 'p1',
      organizationId: 'org_1',
      createdAt: new Date(scheduledAt + HOUR_MS / 2),
    })
  );

  await expect(subject.cancelProjectDeletion('p2')).rejects.toThrow(
    FREE_PLAN_PROJECT_LIMIT_MESSAGE
  );
  expect(projectStore.get('p2')?.deleteAt).not.toBeNull();
});

test('free plan: restoring the old project while the new one is pending deletion is refused', async () => {
  // Delete p1, create p2, delete p2, then restore p1 and p2 in turn.
  subscriptionStateByOrg.set('org_1', 'free');
  const scheduledAt = Date.now() - 2 * HOUR_MS;
  projectStore.set(
    'p1',
    makeProject({
      id: 'p1',
      organizationId: 'org_1',
      createdAt: new Date(scheduledAt - 30 * 24 * HOUR_MS),
      deleteAt: new Date(scheduledAt + 24 * HOUR_MS),
    })
  );
  projectStore.set(
    'p2',
    makeProject({
      id: 'p2',
      organizationId: 'org_1',
      createdAt: new Date(scheduledAt + HOUR_MS / 2),
      deleteAt: new Date(Date.now() + 24 * HOUR_MS),
    })
  );

  await expect(subject.cancelProjectDeletion('p1')).rejects.toThrow(
    FREE_PLAN_PROJECT_LIMIT_MESSAGE
  );
  await subject.cancelProjectDeletion('p2');
  const live = [...projectStore.values()].filter((p) => !p.deleteAt);
  expect(live.map((p) => p.id)).toEqual(['p2']);
});

test('free plan: deleting a pending project again keeps its deadline, so the restore stays refused', async () => {
  subscriptionStateByOrg.set('org_1', 'free');
  const scheduledAt = Date.now() - 2 * HOUR_MS;
  const deadline = new Date(scheduledAt + 24 * HOUR_MS);
  projectStore.set(
    'p1',
    makeProject({
      id: 'p1',
      organizationId: 'org_1',
      createdAt: new Date(scheduledAt - 30 * 24 * HOUR_MS),
      deleteAt: deadline,
    })
  );
  projectStore.set(
    'p2',
    makeProject({
      id: 'p2',
      organizationId: 'org_1',
      createdAt: new Date(scheduledAt + HOUR_MS / 2),
    })
  );

  await subject.scheduleProjectDeletion('p1');
  expect(await subject.deleteProjectForOrganization('p1', 'org_1')).toBe(true);
  expect(projectStore.get('p1')?.deleteAt).toEqual(deadline);
  await expect(subject.cancelProjectDeletion('p1')).rejects.toThrow(
    FREE_PLAN_PROJECT_LIMIT_MESSAGE
  );
});

test('free plan: a downgraded org restores a project it already had', async () => {
  subscriptionStateByOrg.set('org_1', 'free');
  const scheduledAt = Date.now() - HOUR_MS;
  const longAgo = new Date(scheduledAt - 90 * 24 * HOUR_MS);
  for (const id of ['a', 'b']) {
    projectStore.set(
      id,
      makeProject({ id, organizationId: 'org_1', createdAt: longAgo })
    );
  }
  projectStore.set(
    'c',
    makeProject({
      id: 'c',
      organizationId: 'org_1',
      createdAt: longAgo,
      deleteAt: new Date(scheduledAt + 24 * HOUR_MS),
    })
  );

  await subject.cancelProjectDeletion('c');
  expect(projectStore.get('c')?.deleteAt).toBeNull();
});

for (const state of ['active', 'canceling', 'past_due', 'self_hosted']) {
  test(`free plan limit never applies to a ${state} organization`, async () => {
    subscriptionStateByOrg.set('org_1', state);
    projectStore.set('p1', makeProject({ id: 'p1', organizationId: 'org_1' }));
    projectStore.set('p2', makeProject({ id: 'p2', organizationId: 'org_1' }));

    expect(await isFreeProjectLimitReached(deps(), 'org_1')).toBe(false);
  });
}
