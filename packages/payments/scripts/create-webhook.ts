import { Polar } from '@polar-sh/sdk';

/**
 * Register the Polar webhook endpoint that drives subscription state.
 *
 * Without this, a customer can pay and nothing changes: the organization's
 * `subscriptionStatus` and `subscriptionPeriodEventsLimit` are only ever
 * written by apps/api/src/controllers/webhook.controller.ts in response to
 * these events.
 *
 * Usage (POLAR_ACCESS_TOKEN and POLAR_SERVER come from the root .env):
 *
 *   pnpm create-webhook https://<public-host>/webhook/polar
 *
 * Prints the signing secret, which Polar returns exactly once on creation.
 * Existing endpoints for the same URL are reported instead of duplicated,
 * but note their secret cannot be read back afterwards.
 */

// The events webhook.controller.ts actually switches on. Subscribing to more
// just means work the handler ignores.
const EVENTS = [
  'order.updated',
  'subscription.created',
  'subscription.active',
  'subscription.updated',
  'subscription.uncanceled',
  'subscription.canceled',
  'subscription.revoked',
  'subscription.past_due',
] as const;

async function main() {
  const url = process.argv.filter((a) => !a.startsWith('--'))[2];
  if (!url) {
    throw new Error(
      'Usage: pnpm create-webhook https://<public-host>/webhook/polar',
    );
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('POLAR_ACCESS_TOKEN is not set (root .env)');
  }

  const server = process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox';
  const polar = new Polar({ accessToken, server });

  console.log(`\nPolar: ${server.toUpperCase()}`);
  console.log(`URL:   ${url}\n`);

  const existing = await polar.webhooks.listWebhookEndpoints({ limit: 100 });
  const match = existing.result.items.find((e) => e.url === url);
  if (match) {
    console.log('Endpoint already exists for this URL:');
    console.log(' - ID:    ', match.id);
    console.log(' - Events:', match.events.join(', '));
    console.log(
      '\nPolar only reveals the secret at creation. If you do not have it,' +
        '\ndelete this endpoint in the dashboard and re-run.',
    );
    return;
  }

  const endpoint = await polar.webhooks.createWebhookEndpoint({
    url,
    format: 'raw',
    events: [...EVENTS],
    organizationId: process.env.POLAR_ORGANIZATION_ID || undefined,
  });

  console.log('Endpoint created:');
  console.log(' - ID:    ', endpoint.id);
  console.log(' - Events:', endpoint.events.length);
  console.log(`\nPOLAR_WEBHOOK_SECRET=${endpoint.secret}`);
}

main().catch((error) => {
  // The SDK's raw error dump is hundreds of lines and buries the message.
  const status = (error as { statusCode?: number }).statusCode;
  const body = (error as { body?: string }).body;
  console.error(
    `\nFailed${status ? ` (HTTP ${status})` : ''}: ${body ?? (error as Error).message}`,
  );
  process.exit(1);
});
