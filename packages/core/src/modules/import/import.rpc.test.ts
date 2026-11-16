import { expect, mock, test } from 'bun:test';
import { stubHttpCtx } from '../../../test/rpc-fixtures';
import { makeTrpcContext } from '../../rpc/base';
import { TRPCForbiddenError } from '../../rpc/errors';
import type { CookieOptions } from '../../shared/cookie';
import { canImport } from './import.routes';
import { importRouter } from './import.rpc';

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
  return importRouter.createCaller(trpcCtx);
}

test('list rejects an unauthenticated caller before touching a project', async () => {
  const caller = await anonCaller();
  await expect(caller.list({ projectId: 'proj_1' })).rejects.toMatchObject({
    code: 'UNAUTHORIZED',
  });
});

test('create rejects an unauthenticated caller before writing an import', async () => {
  const caller = await anonCaller();
  await expect(
    caller.create({
      projectId: 'proj_1',
      provider: 'umami',
      config: {
        provider: 'umami',
        type: 'file',
        fileUrl: 'https://example.com/export.csv',
        projectMapper: [],
      },
    })
  ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
});

test('delete rejects an unauthenticated caller before removing an import', async () => {
  const caller = await anonCaller();
  await expect(caller.delete({ id: 'imp_1' })).rejects.toMatchObject({
    code: 'UNAUTHORIZED',
  });
});

test('retry rejects an unauthenticated caller before re-enqueuing', async () => {
  const caller = await anonCaller();
  await expect(caller.retry({ id: 'imp_1' })).rejects.toMatchObject({
    code: 'UNAUTHORIZED',
  });
});

function memberCaller(
  overrides: Record<string, unknown>,
  writableProjectIds: string[] = ['proj_1']
) {
  const requireProjectAccess = mock(({ projectId }: { projectId: string }) =>
    writableProjectIds.includes(projectId)
      ? Promise.resolve({ level: 'write' })
      : Promise.reject(
          new TRPCForbiddenError('You do not have access to this project')
        )
  );
  const { ctx } = stubHttpCtx({
    services: { auth: { requireProjectAccess } },
    ...overrides,
  } as unknown as Parameters<typeof stubHttpCtx>[0]);
  return {
    requireProjectAccess,
    caller: async () =>
      importRouter.createCaller(
        await makeTrpcContext(ctx, new Headers(), {
          cookieOptions: COOKIE_OPTIONS,
        })
      ),
  };
}

test('list never returns provider credentials or a presigned query string', async () => {
  const findMany = mock(() =>
    Promise.resolve([
      {
        id: 'imp_1',
        projectId: 'proj_1',
        config: {
          provider: 'mixpanel',
          type: 'api',
          serviceAccount: 'svc-account',
          serviceSecret: 'svc-secret',
          projectId: '123',
          from: '2025-01-01',
          to: '2025-01-31',
        },
      },
      {
        id: 'imp_2',
        projectId: 'proj_1',
        config: {
          provider: 'amplitude',
          type: 'api',
          apiKey: 'amp-key',
          secretKey: 'amp-secret',
          from: '2025-01-01',
          to: '2025-01-31',
        },
      },
      {
        id: 'imp_3',
        projectId: 'proj_1',
        config: {
          provider: 'umami',
          type: 'file',
          fileUrl:
            'https://bucket.s3.amazonaws.com/export.csv?X-Amz-Signature=abc',
          projectMapper: [],
        },
      },
    ])
  );
  const t = memberCaller({ db: { import: { findMany } } });
  const caller = await t.caller();

  const imports = await caller.list({ projectId: 'proj_1' });

  expect(findMany).toHaveBeenCalledTimes(1);
  const serialized = JSON.stringify(imports);
  for (const secret of ['svc-account', 'svc-secret', 'amp-key', 'amp-secret']) {
    expect(serialized).not.toContain(secret);
  }
  expect(imports[2]?.config).toMatchObject({
    fileUrl: 'https://bucket.s3.amazonaws.com/export.csv',
  });
});

test('create refuses an Umami mapping into a project the caller cannot write', async () => {
  const create = mock(() => Promise.resolve({ id: 'imp_1' }));
  const t = memberCaller({ db: { import: { create } } });
  const caller = await t.caller();

  await expect(
    caller.create({
      projectId: 'proj_1',
      provider: 'umami',
      config: {
        provider: 'umami',
        type: 'file',
        fileUrl: 'https://example.com/export.csv',
        projectMapper: [{ from: 'website_1', to: 'proj_other' }],
      },
    })
  ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  expect(t.requireProjectAccess).toHaveBeenCalledWith({
    userId: 'user_1',
    projectId: 'proj_other',
    level: 'write',
  });
  expect(create).not.toHaveBeenCalled();
});

// Privytics: imports write straight into `events`, past the free hard cap.
const FREE_ORG = {
  subscriptionStatus: 'free',
  subscriptionCanceledAt: null,
  subscriptionEndsAt: null,
  subscriptionPauseAtPeriodEnd: false,
  subscriptionPeriodEventsLimit: 10_000,
  // True on free in Privytics, so it must not be what gates imports.
  isActive: true,
};

async function withCloudStates(fn: () => Promise<void>) {
  // test/preload.ts pins SELF_HOSTED=true, which reads every org as self_hosted.
  const preloadSelfHosted = process.env.SELF_HOSTED;
  process.env.SELF_HOSTED = 'false';
  try {
    await fn();
  } finally {
    process.env.SELF_HOSTED = preloadSelfHosted;
  }
}

test('canImport is paid-only, and always on for self-hosted installs', () =>
  withCloudStates(async () => {
    const paid = {
      ...FREE_ORG,
      subscriptionStatus: 'active',
      subscriptionPeriodEventsLimit: 100_000,
    };
    expect(canImport(FREE_ORG, false)).toBe(false);
    expect(
      canImport({ ...FREE_ORG, subscriptionStatus: 'paused' }, false)
    ).toBe(false);
    // An unpaid checkout is hard-capped at ingest like free.
    expect(
      canImport({ ...paid, subscriptionStatus: 'incomplete' }, false)
    ).toBe(false);
    expect(
      canImport({ ...paid, subscriptionPeriodEventsLimit: 0 }, false)
    ).toBe(false);
    expect(canImport(null, false)).toBe(false);
    expect(canImport(paid, false)).toBe(true);
    expect(canImport(FREE_ORG, true)).toBe(true);
    expect(canImport(null, true)).toBe(true);
  }));

test('create refuses an organization on the free plan', () =>
  withCloudStates(async () => {
    const create = mock(() => Promise.resolve({ id: 'imp_1' }));
    const findFirst = mock(() => Promise.resolve(FREE_ORG));
    const t = memberCaller({
      db: { import: { create }, organization: { findFirst } },
    });
    const caller = await t.caller();

    await expect(
      caller.create({
        projectId: 'proj_1',
        provider: 'umami',
        config: {
          provider: 'umami',
          type: 'file',
          fileUrl: 'https://example.com/export.csv',
          projectMapper: [],
        },
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(create).not.toHaveBeenCalled();
  }));

test('retry refuses an organization on the free plan', () =>
  withCloudStates(async () => {
    const update = mock(() => Promise.resolve({}));
    const t = memberCaller({
      db: {
        import: {
          findUniqueOrThrow: mock(() =>
            Promise.resolve({
              id: 'imp_1',
              projectId: 'proj_1',
              status: 'failed',
              config: {
                provider: 'umami',
                type: 'file',
                fileUrl: 'https://example.com/export.csv',
                projectMapper: [],
              },
            })
          ),
          update,
        },
        organization: { findFirst: mock(() => Promise.resolve(FREE_ORG)) },
      },
    });
    const caller = await t.caller();

    await expect(caller.retry({ id: 'imp_1' })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    expect(update).not.toHaveBeenCalled();
  }));

test('create refuses an Umami mapping into another organization on the free plan', () =>
  withCloudStates(async () => {
    const create = mock(() => Promise.resolve({ id: 'imp_1' }));
    const paid = {
      ...FREE_ORG,
      subscriptionStatus: 'active',
      subscriptionPeriodEventsLimit: 100_000,
    };
    const findMany = mock(() => Promise.resolve([FREE_ORG]));
    const t = memberCaller(
      {
        db: {
          import: { create },
          organization: {
            findFirst: mock(() => Promise.resolve(paid)),
            findMany,
          },
        },
      },
      ['proj_1', 'proj_free']
    );
    const caller = await t.caller();

    await expect(
      caller.create({
        projectId: 'proj_1',
        provider: 'umami',
        config: {
          provider: 'umami',
          type: 'file',
          fileUrl: 'https://example.com/export.csv',
          projectMapper: [{ from: 'website_1', to: 'proj_free' }],
        },
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(findMany).toHaveBeenCalledWith({
      where: { projects: { some: { id: { in: ['proj_free'] } } } },
    });
    expect(create).not.toHaveBeenCalled();
  }));
