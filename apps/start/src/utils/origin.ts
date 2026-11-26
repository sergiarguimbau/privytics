const HAS_SCHEME = /^https?:\/\//i;
// Dev servers on these hosts are served without TLS.
const LOCAL_HOST =
  /^((?:[\w-]+\.)*localhost|127\.0\.0\.1)(?::\d+)?(?:[/?#]|$)/i;

/**
 * What a browser sends as Origin for the address a user typed: scheme added
 * when missing (http for localhost, https otherwise), lower-cased host, no
 * path, query or trailing slash. `*` and wildcard hosts such as
 * `*.example.com` are kept.
 */
export function toOrigin(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '*') {
    return trimmed;
  }
  const scheme = LOCAL_HOST.test(trimmed) ? 'http' : 'https';
  const withScheme = HAS_SCHEME.test(trimmed)
    ? trimmed
    : `${scheme}://${trimmed}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return withScheme.replace(/\/+$/, '');
  }
}
