/**
 * Privytics: the overview AI command bar is a model turn on the operator's
 * key, so `runFilterCommand` must refuse plans without AI, like the chat.
 */

import { afterAll, beforeAll, beforeEach, expect, mock, test } from 'bun:test';
import {
  servicesWithProjectAccess,
  stubHttpCtx,
  TEST_SESSION,
} from '../../../test/rpc-fixtures';
import type { HttpCtx } from '../../context';
import type { Services } from '../../services';
import type { CookieOptions } from '../../shared/cookie';

const getOrganizationByProjectIdCached = mock(
  async (_deps: unknown, _projectId: string): Promise<unknown> => null
);

// Snapshot restore, as in wind-down.test.ts (see AGENTS.md).
const realOrganizationService = {
  ...(await import('../organization/organization.service')),
};
mock.module('../organization/organization.service', () => ({
  ...realOrganizationService,
  getOrganizationByProjectIdCached,
  getSettingsForProject: async () => ({ timezone: 'UTC' }),
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

let overviewRouter: typeof import('./overview.rpc').overviewRouter;
let makeTrpcContext: typeof import('../../rpc/base').makeTrpcContext;
beforeAll(async () => {
  process.env.SELF_HOSTED = 'false';
  ({ overviewRouter } = await import('./overview.rpc'));
  ({ makeTrpcContext } = await import('../../rpc/base'));
});

const runFilterCommand = mock(async () => ({ summary: 'ok' }));
beforeEach(() => {
  getOrganizationByProjectIdCached.mockReset();
  runFilterCommand.mockClear();
});

const COOKIE_OPTIONS: CookieOptions = {
  domain: '.privytics.com',
  secure: true,
  sameSite: 'lax',
  httpOnly: true,
  path: '/',
};

/** Counters always under every cap. */
const redis = {
  get: async () => null,
  incr: async () => 1,
  pttl: async () => 60_000,
  pexpire: async () => 1,
} as unknown as HttpCtx['redis'];

const ORGANIZATION = {
  id: 'org-1',
  subscriptionStatus: 'free',
  subscriptionCanceledAt: null,
  subscriptionEndsAt: null,
  subscriptionPauseAtPeriodEnd: false,
  subscriptionPeriodEventsLimit: 10_000,
};

async function runFor(organization: unknown) {
  getOrganizationByProjectIdCached.mockResolvedValue(organization);
  const services = {
    ...servicesWithProjectAccess(),
    assistant: { runFilterCommand },
  } as unknown as Services;
  const { ctx } = stubHttpCtx({ services, redis }, TEST_SESSION);
  const trpcCtx = await makeTrpcContext(ctx, new Headers(), {
    cookieOptions: COOKIE_OPTIONS,
  });
  return overviewRouter
    .createCaller(trpcCtx)
    .runFilterCommand({ projectId: 'proj-1', query: 'mobile only' });
}

test('a free org is refused before any model call', async () => {
  await expect(runFor(ORGANIZATION)).rejects.toMatchObject({
    code: 'TOO_MANY_REQUESTS',
    message: expect.stringContaining('paid plans'),
  });
  expect(runFilterCommand).not.toHaveBeenCalled();
});

test('a paid org (the comped one: active, no end date) runs the command', async () => {
  await runFor({
    ...ORGANIZATION,
    id: 'privytics',
    subscriptionStatus: 'active',
    subscriptionPeriodEventsLimit: 10_000_000,
  });
  expect(runFilterCommand).toHaveBeenCalledTimes(1);
});
