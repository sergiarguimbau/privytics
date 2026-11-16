import { expect, test } from './fixtures';
import {
  apiFailures,
  dismissFeedbackPrompt,
  expectNoCrashes,
  gotoHydrated,
  shot,
  watchProblems,
} from './org-helpers';

// The shared dev server takes 10-25s per navigation while other suites run.
const SLOW_DEV_SERVER_TIMEOUT_MS = 150_000;

test.setTimeout(SLOW_DEV_SERVER_TIMEOUT_MS);

// The seeded org is active with no Polar subscription, the shape of a plan set
// up by hand (like the comped production org): a custom plan, no picker. The
// picker is covered on a free org in org-multi.spec.ts.
test('billing renders the custom plan, the usage breakdown and the FAQ without errors', async ({
  page,
  seed,
}) => {
  const problems = watchProblems(page);
  await dismissFeedbackPrompt(page);
  await gotoHydrated(page, `/${seed.organizationId}/billing`);

  await expect(
    page.getByRole('heading', { name: 'Billing', level: 1 })
  ).toBeVisible();
  await expect(page.getByText('Custom plan', { exact: true })).toBeVisible();
  await expect(page.getByText('Choose a plan', { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /events per month/ })
  ).toHaveCount(0);

  // The usage breakdown: one stacked bar per day split by project, and the
  // event-name donut, each with a share table listing the seeded projects
  // and the most frequent names.
  await expect(page.getByText('Events per project')).toBeVisible();
  await expect(page.getByText('Events by name')).toBeVisible();
  // No Polar billing period, so both widgets fall back to a trailing window.
  await expect(page.getByText(/Last 30 days ·/)).toHaveCount(2);
  for (const project of seed.projects) {
    await expect(page.getByText(project.name, { exact: true })).toBeVisible();
  }
  await expect(page.getByText('screen_view', { exact: true })).toBeVisible();
  await expect(page.getByText('Other', { exact: true })).toBeVisible();

  // Selecting a project narrows the donut to that project's names.
  const firstProject = seed.projects[0]!;
  await page.getByRole('button', { name: firstProject.name }).click();
  await expect(
    page.getByText(new RegExp(`^${firstProject.name} · Last 30 days`))
  ).toBeVisible();
  await page.getByRole('button', { name: 'All projects' }).click();
  await expect(page.getByText(/^All projects · Last 30 days/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/NaN|undefined/);

  const question = page.getByRole('button', {
    name: 'Is there a free plan?',
  });
  const answer = page.getByText(/10,000 events a month, free forever/);
  await question.click();
  await expect(answer).toBeVisible();
  await question.click();
  await expect(answer).toBeHidden();

  await shot(page, 'billing');
  expectNoCrashes(problems);
  expect(apiFailures(problems)).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  // The charts re-measure asynchronously after a resize.
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      )
    )
    .toBeLessThanOrEqual(0);
});
