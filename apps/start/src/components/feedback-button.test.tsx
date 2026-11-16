// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { FEEDBACK_MAILTO, FeedbackButton } from './feedback-button';

vi.mock('@/utils/op', () => ({ op: { track: vi.fn() } }));

// Privytics: feedback is a mailto to us. No Userjot widget, no third-party
// board, on cloud and self-hosted alike.
describe('FeedbackButton', () => {
  afterEach(cleanup);

  test('links to the Privytics feedback mailbox', () => {
    render(<FeedbackButton />);
    const link = screen.getByRole('link', { name: 'Give feedback' });
    expect(link.getAttribute('href')).toBe(FEEDBACK_MAILTO);
    expect(FEEDBACK_MAILTO.startsWith('mailto:')).toBe(true);
    expect(screen.queryByRole('button')).toBeNull();
  });

  test('renders custom children', () => {
    render(<FeedbackButton>Tell us</FeedbackButton>);
    expect(screen.getByRole('link', { name: 'Tell us' })).toBeDefined();
  });
});
