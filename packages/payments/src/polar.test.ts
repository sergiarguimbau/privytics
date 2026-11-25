import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  PolarWebhookVerificationError,
  toPolarSubscription,
  validatePolarEvent,
} from './polar.js';

const secret = `whsec_${Buffer.alloc(32, 7).toString('base64')}`;
const standardKey = Buffer.from(secret.slice('whsec_'.length), 'base64');
const legacyKey = Buffer.from(secret);
const body = JSON.stringify({ type: 'order.updated', data: { id: 'ord_1' } });

function headersSignedWith(
  key: Buffer,
  timestamp = Math.floor(Date.now() / 1000)
) {
  const id = 'msg_1';
  const signature = createHmac('sha256', key)
    .update(`${id}.${timestamp}.${body}`)
    .digest('base64');
  return {
    'webhook-id': id,
    'webhook-timestamp': String(timestamp),
    'webhook-signature': `v1,${signature}`,
  };
}

const VERIFIED = { type: 'order.updated', data: { id: 'ord_1' } };

describe('validatePolarEvent', () => {
  it('accepts Standard Webhooks signatures (secrets from 8 Sep 2026)', async () => {
    await expect(
      validatePolarEvent(body, headersSignedWith(standardKey), secret)
    ).resolves.toEqual(VERIFIED);
  });

  it('accepts the older Polar signatures', async () => {
    await expect(
      validatePolarEvent(body, headersSignedWith(legacyKey), secret)
    ).resolves.toEqual(VERIFIED);
  });

  it('rejects any other key', async () => {
    await expect(
      validatePolarEvent(body, headersSignedWith(Buffer.from('x')), secret)
    ).rejects.toThrow(PolarWebhookVerificationError);
  });

  it('still rejects a stale timestamp', async () => {
    await expect(
      validatePolarEvent(body, headersSignedWith(standardKey, 1), secret)
    ).rejects.toThrow(PolarWebhookVerificationError);
  });
});

describe('toPolarSubscription', () => {
  it('reads timestamps as Dates and keeps unset ones null', () => {
    const subscription = toPolarSubscription({
      id: 'sub_1',
      status: 'active',
      product_id: 'prod_1',
      created_at: '2026-10-01T09:00:00Z',
      current_period_start: '2026-11-01T09:00:00Z',
      current_period_end: '2026-12-01T09:00:00Z',
      canceled_at: null,
      resumes_at: '2027-02-01T09:00:00Z',
      cancel_at_period_end: false,
      pause_at_period_end: true,
    } as Parameters<typeof toPolarSubscription>[0]);
    expect(subscription).toMatchObject({
      productId: 'prod_1',
      createdAt: new Date('2026-10-01T09:00:00Z'),
      currentPeriodStart: new Date('2026-11-01T09:00:00Z'),
      currentPeriodEnd: new Date('2026-12-01T09:00:00Z'),
      canceledAt: null,
      resumesAt: new Date('2027-02-01T09:00:00Z'),
      cancelAtPeriodEnd: false,
      pauseAtPeriodEnd: true,
    });
  });
});
