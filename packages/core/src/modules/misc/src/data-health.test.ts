// Privytics: a free org blocked by its own hard cap this month must not get
// the "your tracking stopped, check your snippet" rescue email.

import { afterEach, expect, mock, setSystemTime, test } from 'bun:test';
import { testCoreConfig } from '../../../../test/config-fixture';
import { recordingLogger } from '../../../../test/service-deps';
import {
  type DataHealthDeps,
  type DataHealthProject,
  runDataHealthCron,
} from './data-health';

const NOW = new Date('2026-11-16T07:30:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

afterEach(() => {
  setSystemTime();
});

function stalledProject(
  id: string,
  exceededAt: Date | null
): DataHealthProject {
  return {
    id,
    name: id,
    createdAt: new Date(NOW.getTime() - 90 * DAY_MS),
    organizationId: `org_${id}`,
    noDataNotifiedAt: null,
    dataStoppedNotifiedAt: null,
    organization: {
      id: `org_${id}`,
      subscriptionState: 'free',
      subscriptionPeriodEventsLimit: 10_000,
      subscriptionPeriodEventsCountExceededAt: exceededAt,
      onboarding: 'completed',
    },
  };
}

test('a free org capped this month gets no data-stopped email; one capped last month does', async () => {
  setSystemTime(NOW);
  const projects = [
    stalledProject('capped', new Date('2026-11-05T10:00:00.000Z')),
    stalledProject('last_month', new Date('2026-10-20T10:00:00.000Z')),
  ];
  const lastEventAt = new Date(NOW.getTime() - 10 * DAY_MS);
  const sendEmail = mock(
    async (
      _template: string,
      _options: { to: string; data: Record<string, unknown> }
    ) => undefined
  );
  const deps: DataHealthDeps = {
    db: {
      project: {
        findMany: async () => projects,
        updateMany: async () => undefined,
      },
      member: {
        findMany: async () => [
          {
            role: 'admin',
            projectScope: 'all',
            projects: [],
            user: { email: 'owner@example.com', firstName: 'Owner' },
          },
        ],
      },
    },
    logger: recordingLogger(),
    config: testCoreConfig(),
    getLastEventPerProject: async () =>
      new Map(projects.map((p) => [p.id, lastEventAt])),
    sendEmail,
  };

  const result = await runDataHealthCron(deps);

  expect(result?.emailsSent).toBe(1);
  expect(sendEmail).toHaveBeenCalledTimes(1);
  expect(sendEmail.mock.calls[0]?.[0]).toBe('tracking-data-stopped');
  expect(sendEmail.mock.calls[0]?.[1]?.data.projectNames).toEqual([
    'last_month',
  ]);
});

test('a free org capped last month is not rescued until it has been silent 7 days since the cap lifted', async () => {
  setSystemTime(NOW);
  const cappedAt = new Date('2026-10-20T10:00:00.000Z');
  const projects = [stalledProject('capped_oct', cappedAt)];
  const sendEmail = mock(async () => undefined);
  const depsAt = (lastEventAt: Date): DataHealthDeps => ({
    db: {
      project: {
        findMany: async () => projects,
        updateMany: async () => undefined,
      },
      member: {
        findMany: async () => [
          {
            role: 'admin',
            projectScope: 'all',
            projects: [],
            user: { email: 'owner@example.com', firstName: 'Owner' },
          },
        ],
      },
    },
    logger: recordingLogger(),
    config: testCoreConfig(),
    getLastEventPerProject: async () => new Map([['capped_oct', lastEventAt]]),
    sendEmail,
  });
  // The last event got through just before the flag landed.
  const lastEventAt = new Date(cappedAt.getTime() - 60_000);

  // Nov 3: the cap lifted on Nov 1, only 2 days of silence since.
  setSystemTime(new Date('2026-11-03T07:30:00.000Z'));
  expect((await runDataHealthCron(depsAt(lastEventAt)))?.emailsSent).toBe(0);

  // Nov 16: silent for 15 days since the cap lifted, so the snippet is broken.
  setSystemTime(NOW);
  expect((await runDataHealthCron(depsAt(lastEventAt)))?.emailsSent).toBe(1);
});
