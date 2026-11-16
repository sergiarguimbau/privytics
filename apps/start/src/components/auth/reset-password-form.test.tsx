// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { ResetLinkMissing } from './reset-password-form';
import { Route } from '@/routes/_login.reset-password';

// /reset-password without ?token used to throw a Zod error and dead-end.
describe('reset password without a token', () => {
  afterEach(cleanup);

  test('search validation accepts a missing or malformed token', () => {
    const schema = Route.options.validateSearch as {
      parse: (input: unknown) => { token?: string };
    };
    expect(schema.parse({})).toEqual({ token: undefined });
    expect(schema.parse({ token: 123 })).toEqual({ token: undefined });
    expect(schema.parse({ token: 'abc' })).toEqual({ token: 'abc' });
  });

  test('links back to sign in', () => {
    render(<ResetLinkMissing />);
    const link = screen.getByRole('link', { name: 'Back to sign in' });
    expect(link.getAttribute('href')).toBe('/login');
  });
});
