/**
 * What a browser sends as Origin for the address a user typed: scheme added
 * when missing, lower-cased host, no path, query or trailing slash. `*` and
 * wildcard hosts such as `*.example.com` are kept.
 */
export function toOrigin(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '*') {
    return trimmed;
  }
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return withScheme.replace(/\/+$/, '');
  }
}
