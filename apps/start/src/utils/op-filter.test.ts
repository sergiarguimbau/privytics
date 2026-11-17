// @vitest-environment jsdom

import type { TrackHandlerPayload } from '@openpanel/web';
import { afterEach, describe, expect, it } from 'vitest';
import { shouldSendAnalyticsEvent } from './op-filter';

function screenView(properties: Record<string, unknown>): TrackHandlerPayload {
  return { type: 'track', payload: { name: 'screen_view', properties } };
}

describe('shouldSendAnalyticsEvent', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('sends ordinary page views', () => {
    expect(
      shouldSendAnalyticsEvent(
        screenView({ __path: `${window.location.origin}/login` })
      )
    ).toBe(true);
  });

  it('drops a page view of the reset-password page', () => {
    expect(
      shouldSendAnalyticsEvent(
        screenView({
          __path: `${window.location.origin}/reset-password?token=secret`,
        })
      )
    ).toBe(false);
  });

  it('drops events whose referrer is the unsubscribe page', () => {
    expect(
      shouldSendAnalyticsEvent(
        screenView({
          __path: `${window.location.origin}/login`,
          __referrer: `${window.location.origin}/unsubscribe?token=secret`,
        })
      )
    ).toBe(false);
  });

  it('drops outgoing-link events that point at the reset-password page', () => {
    expect(
      shouldSendAnalyticsEvent(
        screenView({
          __path: `${window.location.origin}/login`,
          href: `${window.location.origin}/reset-password?token=secret`,
        })
      )
    ).toBe(false);
  });

  it('drops every event while the browser is on a credential page', () => {
    window.history.replaceState(null, '', '/reset-password?token=secret');
    expect(
      shouldSendAnalyticsEvent({
        type: 'track',
        payload: { name: 'link_out', properties: {} },
      })
    ).toBe(false);
  });
});

describe('our own analytics never carries a customer end user', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });
  const origin = () => window.location.origin;
  const sent = (properties: Record<string, unknown>) => {
    const event = screenView(properties);
    expect(shouldSendAnalyticsEvent(event)).toBe(true);
    return (event.payload as { properties: Record<string, unknown> })
      .properties;
  };

  it.each([
    ['/acme/shop/profiles/jane@example.com', '/acme/shop/profiles/:id'],
    ['/acme/shop/profiles/u_42/events', '/acme/shop/profiles/:id/events'],
    ['/acme/shop/profiles/identified', '/acme/shop/profiles/identified'],
    ['/acme/shop/profiles/power-users', '/acme/shop/profiles/power-users'],
    ['/acme/shop/sessions/s-123', '/acme/shop/sessions/:id'],
    ['/acme/shop/sessions', '/acme/shop/sessions'],
    ['/acme/shop/groups/acme-inc/members', '/acme/shop/groups/:id/members'],
    ['/acme/shop/ai/traces/t-9', '/acme/shop/ai/traces/:id'],
    ['/acme/shop/ai/traces', '/acme/shop/ai/traces'],
    // A referrer from a share page still names the link.
    ['/share/overview/abc123', '/share/overview/:id'],
    ['/invite/inv_1', '/invite/:id'],
    ['/acme/shop/reports/r1', '/acme/shop/reports/r1'],
  ])('masks %s as %s', (path, expected) => {
    expect(sent({ __path: `${origin()}${path}` }).__path).toBe(
      `${origin()}${expected}`
    );
  });

  it('drops the query string and hash of same-site URLs', () => {
    const properties = sent({
      __path: `${origin()}/acme/shop/profiles?search=jane@example.com#top`,
      __referrer: `${origin()}/acme/shop/events?f=email:jane@example.com`,
    });
    expect(properties.__path).toBe(`${origin()}/acme/shop/profiles`);
    expect(properties.__referrer).toBe(`${origin()}/acme/shop/events`);
  });

  it('keeps only the origin of other sites, and no link text', () => {
    const properties = sent({
      __path: `${origin()}/login`,
      href: 'https://shop.example.com/users/jane-doe?ref=dashboard',
      text: 'Jane Doe',
    });
    expect(properties.href).toBe('https://shop.example.com');
    expect(properties.text).toBeUndefined();
  });

  it('leaves modal screen names alone', () => {
    expect(sent({ __path: 'modal:SaveReport' }).__path).toBe('modal:SaveReport');
  });

  it.each(['/widget/realtime?shareId=abc', '/share/overview/abc123'])(
    'sends nothing from %s, whose viewers are not our users',
    (path) => {
      window.history.replaceState(null, '', path);
      expect(
        shouldSendAnalyticsEvent(screenView({ __path: `${origin()}${path}` }))
      ).toBe(false);
    }
  );
});
