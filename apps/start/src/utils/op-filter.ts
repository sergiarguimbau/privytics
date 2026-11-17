import type { TrackHandlerPayload } from '@openpanel/web';

// These pages carry a credential (reset token, unsubscribe token) in the URL.
const PATHS_WITH_URL_CREDENTIALS = new Set(['/reset-password', '/unsubscribe']);

// Widgets are embedded on customers' own sites and share pages are opened by
// anyone with the link: their viewers are not our users, so nothing is sent.
const UNTRACKED_PREFIXES = ['/widget/', '/share/'];

// Screen views carry their URL in `__path` and `__referrer`; outgoing-link
// events in `href`.
const URL_PROPERTIES = ['__path', '__referrer', 'href'] as const;

// Privytics tracks its own dashboard, but what a customer looks at in it is
// their end users' data, which we only process on their behalf (DPA). So our
// analytics keeps which page and action, never whose: the id after these
// segments is replaced, except for the static tabs listed with it. Share and
// invite ids are masked too, because they grant access.
const ID_AFTER: Record<string, ReadonlySet<string>> = {
  profiles: new Set(['anonymous', 'identified', 'power-users']),
  sessions: new Set(),
  groups: new Set(),
  traces: new Set(),
  invite: new Set(),
};
const SHARE_KINDS = new Set(['dashboard', 'overview', 'report']);
const MASK = ':id';

function pointsAtCredentialPage(url: unknown): boolean {
  if (typeof url !== 'string' || url === '') {
    return false;
  }
  try {
    const { pathname } = new URL(url, window.location.origin);
    return PATHS_WITH_URL_CREDENTIALS.has(pathname);
  } catch {
    return false;
  }
}

function maskPath(pathname: string): string {
  const segments = pathname.split('/');
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i] ?? '';
    const next = segments[i + 1] ?? '';
    const keep = ID_AFTER[segment];
    if (keep && next !== '' && !keep.has(next)) {
      segments[i + 1] = MASK;
    }
    if (segment === 'share' && SHARE_KINDS.has(next) && segments[i + 2]) {
      segments[i + 2] = MASK;
    }
  }
  return segments.join('/');
}

/**
 * Same-site URLs lose their query string and hash (searches and filters can
 * hold anything a customer typed) and have end-user ids masked. Other sites'
 * web URLs keep only their origin: outgoing links often point at a customer's
 * own pages, whose paths can name their end users.
 */
export function sanitizeAnalyticsUrl(value: string): string {
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) {
      return url.protocol.startsWith('http') ? url.origin : value;
    }
    return `${url.origin}${maskPath(url.pathname)}`;
  } catch {
    return value;
  }
}

/**
 * The SDK's `filter`: drops events from pages whose URL carries a credential,
 * and rewrites the URL properties of every other event in place (the SDK sends
 * the very payload object it passed here), so no end-user data from a
 * customer's project reaches our own analytics.
 */
export function shouldSendAnalyticsEvent(event: TrackHandlerPayload): boolean {
  const { pathname } = window.location;
  if (
    pointsAtCredentialPage(window.location.href) ||
    UNTRACKED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return false;
  }
  const properties: Record<string, unknown> =
    'properties' in event.payload && event.payload.properties
      ? event.payload.properties
      : {};
  if (URL_PROPERTIES.some((key) => pointsAtCredentialPage(properties[key]))) {
    return false;
  }
  for (const key of URL_PROPERTIES) {
    const value = properties[key];
    if (typeof value === 'string' && value !== '') {
      properties[key] = sanitizeAnalyticsUrl(value);
    }
  }
  // An outgoing link's text can be an end user's name or an AI answer.
  delete properties.text;
  return true;
}
