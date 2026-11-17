// Cloudflare Pages Function: GET /api/status -> { "state": "operational" }.
//
// The footer's status light asks this same-origin endpoint instead of Better
// Stack, so a visitor's browser never contacts a third party just because they
// scrolled the footer into view. Only the aggregate state leaves this function,
// and the edge cache answers repeat requests for a minute.
//
// Plain JavaScript on purpose: apps/public's tsconfig includes every .ts file,
// and Next would try to typecheck a Workers handler.

const SOURCE = 'https://status.privytics.com/index.json';
const STATES = new Set(['operational', 'degraded', 'downtime', 'maintenance']);
const TTL_SECONDS = 60;

export async function onRequestGet(context) {
  const cache = caches.default;
  const key = new Request(new URL('/api/status', context.request.url).toString());
  const cached = await cache.match(key);
  if (cached) {
    return cached;
  }

  let state = 'unknown';
  try {
    const upstream = await fetch(SOURCE, {
      headers: { accept: 'application/json' },
    });
    if (upstream.ok) {
      const body = await upstream.json();
      const aggregate = body?.data?.attributes?.aggregate_state;
      if (STATES.has(aggregate)) {
        state = aggregate;
      }
    }
  } catch {
    // Unknown renders as a neutral "System status" link, never a green light.
  }

  const response = new Response(JSON.stringify({ state }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${TTL_SECONDS}`,
    },
  });
  context.waitUntil(cache.put(key, response.clone()));
  return response;
}
