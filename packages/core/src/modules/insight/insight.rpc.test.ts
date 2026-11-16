// The "is anyone logged in" boundary and the paid-only AI gate are exercised
// here, with no database; the access checks and business logic are covered in
// insight.service.test.ts.

import { expect, mock, test } from 'bun:test';
import { stubHttpCtx } from '../../../test/rpc-fixtures';
import { makeTrpcContext } from '../../rpc/base';
import type { CookieOptions } from '../../shared/cookie';
import { insightRouter } from './insight.rpc';

const COOKIE_OPTIONS: CookieOptions = {
  domain: '.openpanel.dev',
  secure: true,
  sameSite: 'lax',
  httpOnly: true,
  path: '/',
};

// `TrpcContext.session` is never literally `null`, only its `userId` is.
const EMPTY_SESSION = { session: null, user: null, userId: null };

async function anonCaller() {
  const { ctx } = stubHttpCtx({}, EMPTY_SESSION);
  const trpcCtx = await makeTrpcContext(ctx, new Headers(), {
    cookieOptions: COOKIE_OPTIONS,
  });
  return insightRouter.createCaller(trpcCtx);
}

test('list rejects an unauthenticated caller before touching a project', async () => {
  const caller = await anonCaller();
  await expect(caller.list({ projectId: 'proj_1' })).rejects.toMatchObject({
    code: 'UNAUTHORIZED',
  });
});

test('listAll rejects an unauthenticated caller before touching a project', async () => {
  const caller = await anonCaller();
  await expect(caller.listAll({ projectId: 'proj_1' })).rejects.toMatchObject({
    code: 'UNAUTHORIZED',
  });
});

test('explain rejects an unauthenticated caller before reading an insight', async () => {
  const caller = await anonCaller();
  await expect(
    caller.explain({ insightId: 'insight_1' })
  ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
});

test('explain refuses an organization on the free plan before calling the model', async () => {
  // test/preload.ts pins SELF_HOSTED=true, which reads every org as self_hosted.
  const preloadSelfHosted = process.env.SELF_HOSTED;
  process.env.SELF_HOSTED = 'false';
  try {
    const explainInsight = mock(async () => ({ explanation: 'x' }));
    // A project id no other test caches the organization lookup under.
    const projectId = `proj_free_${crypto.randomUUID()}`;
    const { ctx } = stubHttpCtx({
      db: {
        projectInsight: {
          findUniqueOrThrow: async () => ({
            projectId,
            title: 'Traffic up',
            lastUpdatedAt: new Date(),
          }),
        },
        project: {
          findUniqueOrThrow: async () => ({
            organization: {
              id: 'org_free',
              subscriptionStatus: 'free',
              subscriptionCanceledAt: null,
              subscriptionEndsAt: null,
              subscriptionPauseAtPeriodEnd: false,
              subscriptionPeriodEventsLimit: 10_000,
            },
          }),
        },
      },
      services: {
        auth: { requireProjectAccess: async () => ({ level: 'read' }) },
        insight: { explainInsight },
      },
    } as unknown as Parameters<typeof stubHttpCtx>[0]);
    const caller = insightRouter.createCaller(
      await makeTrpcContext(ctx, new Headers(), {
        cookieOptions: COOKIE_OPTIONS,
      })
    );

    await expect(
      caller.explain({ insightId: 'insight_1' })
    ).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' });
    expect(explainInsight).not.toHaveBeenCalled();
  } finally {
    process.env.SELF_HOSTED = preloadSelfHosted;
  }
});
