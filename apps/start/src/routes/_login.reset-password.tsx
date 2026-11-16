import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import {
  ResetLinkMissing,
  ResetPasswordForm,
} from '@/components/auth/reset-password-form';
import { createTitle, PAGE_TITLES } from '@/utils/title';

export const Route = createFileRoute('/_login/reset-password')({
  head: () => ({
    meta: [
      { title: createTitle(PAGE_TITLES.RESET_PASSWORD) },
      { name: 'robots', content: 'noindex, follow' },
    ],
  }),
  component: Component,
  // A missing or malformed token renders ResetLinkMissing instead of throwing.
  validateSearch: z.object({
    token: z.string().optional().catch(undefined),
  }),
});

function Component() {
  const { token } = Route.useSearch();

  return (
    <div className="col w-full gap-8">
      {token ? <ResetPasswordForm token={token} /> : <ResetLinkMissing />}
    </div>
  );
}
