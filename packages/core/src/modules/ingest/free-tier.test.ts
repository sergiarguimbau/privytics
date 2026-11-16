/**
 * Privytics: `isFreeTierBlocked`, the free-tier hard cap at ingestion. It
 * gates on this month's exceeded flag (never on the stale counter, which only
 * moves when a session ends) so a blocked org unblocks when the month rolls.
 */

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';
import type { Logger } from '../../logger';
import type { ServiceDeps } from '../../services';

const getOrganizationByProjectIdCached = mock(
  async (_deps: unknown, _projectId: string): Promise<unknown> => null
);
const deps = { marker: 'service-deps' } as unknown as ServiceDeps;

// Snapshot restore, as in wind-down.test.ts (see AGENTS.md).
const realOrganizationService = {
  ...(await import('../organization/organization.service')),
};
mock.module('../organization/organization.service', () => ({
  ...realOrganizationService,
  getOrganizationByProjectIdCached,
}));
// test/preload.ts pins SELF_HOSTED=true, under which getSubscriptionState
// always answers 'self_hosted'; this file exercises the cloud states.
const preloadSelfHosted = process.env.SELF_HOSTED;
afterAll(() => {
  process.env.SELF_HOSTED = preloadSelfHosted;
  mock.module(
    '../organization/organization.service',
    () => realOrganizationService
  );
});

let isFreeTierBlocked: typeof import('./ingest.service').isFreeTierBlocked;
beforeAll(async () => {
  process.env.SELF_HOSTED = 'false';
  ({ isFreeTierBlocked } = await import('./ingest.service'));
});
beforeEach(() => {
  getOrganizationByProjectIdCached.mockReset();
});

const noop = () => undefined;
const logger = {
  info: noop,
  warn: noop,
  error: noop,
  debug: noop,
  trace: noop,
  fatal: noop,
  child: () => logger,
} as unknown as Logger;

const NOW = new Date('2026-11-16T12:00:00Z');
const FREE = {
  id: 'org-1',
  subscriptionStatus: 'free',
  subscriptionCanceledAt: null,
  subscriptionEndsAt: null,
  subscriptionPauseAtPeriodEnd: false,
  subscriptionPeriodEventsLimit: 10_000,
  subscriptionPeriodEventsCountExceededAt: null,
};

function check(org: unknown, type = 'track') {
  getOrganizationByProjectIdCached.mockResolvedValue(org);
  return isFreeTierBlocked(
    deps,
    { projectId: 'proj-1', selfHosted: false, type, logger },
    NOW
  );
}

describe('isFreeTierBlocked', () => {
  it('blocks a free org flagged over its limit this month', async () => {
    expect(
      await check({
        ...FREE,
        subscriptionPeriodEventsCountExceededAt: new Date(
          '2026-11-03T00:00:00Z'
        ),
      })
    ).toBe('free_limit');
  });

  it('allows a free org flagged over its limit last month', async () => {
    expect(
      await check({
        ...FREE,
        subscriptionPeriodEventsCountExceededAt: new Date(
          '2026-10-28T00:00:00Z'
        ),
      })
    ).toBeNull();
  });

  it('blocks a free org with no allowance at once', async () => {
    expect(await check({ ...FREE, subscriptionPeriodEventsLimit: 0 })).toBe(
      'free_limit'
    );
  });

  it('blocks session replay on the free plan', async () => {
    expect(await check(FREE, 'replay')).toBe('replay_paid_only');
    expect(await check(FREE, 'track')).toBeNull();
  });

  it('holds an unpaid incomplete checkout to its earlier limit', async () => {
    const incomplete = { ...FREE, subscriptionStatus: 'incomplete' };
    expect(await check(incomplete, 'replay')).toBe('replay_paid_only');
    expect(
      await check({ ...incomplete, subscriptionPeriodEventsLimit: 0 })
    ).toBe('free_limit');
  });

  it('never blocks a paid org, over its limit or sending replay', async () => {
    const paid = {
      ...FREE,
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date('2099-01-01T00:00:00Z'),
      subscriptionPeriodEventsLimit: 100_000,
      subscriptionPeriodEventsCountExceededAt: new Date('2026-11-10T00:00:00Z'),
    };
    expect(await check(paid)).toBeNull();
    expect(await check(paid, 'replay')).toBeNull();
  });

  it('is off on self-hosted installs and fails open', async () => {
    getOrganizationByProjectIdCached.mockResolvedValue({
      ...FREE,
      subscriptionPeriodEventsLimit: 0,
    });
    expect(
      await isFreeTierBlocked(
        deps,
        { projectId: 'proj-1', selfHosted: true, type: 'track', logger },
        NOW
      )
    ).toBeNull();

    getOrganizationByProjectIdCached.mockRejectedValue(new Error('redis down'));
    expect(await check(FREE)).toBeNull();
  });
});
