import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { PolarWebhookVerificationError, validatePolarEvent } from './polar.js';

const secret = `whsec_${Buffer.alloc(32, 7).toString('base64')}`;
const standardKey = Buffer.from(secret.slice('whsec_'.length), 'base64');
const legacyKey = Buffer.from(secret);
const body = JSON.stringify({ type: 'not.an.event', data: {} });

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

// A verified body reaches the SDK's parser, which rejects the made-up type.
const VERIFIED = 'Failed to parse event';

describe('validatePolarEvent', () => {
  it('accepts Standard Webhooks signatures (secrets from 8 Sep 2026)', () => {
    expect(() =>
      validatePolarEvent(body, headersSignedWith(standardKey), secret)
    ).toThrow(VERIFIED);
  });

  it('accepts the older Polar signatures', () => {
    expect(() =>
      validatePolarEvent(body, headersSignedWith(legacyKey), secret)
    ).toThrow(VERIFIED);
  });

  it('rejects any other key', () => {
    expect(() =>
      validatePolarEvent(body, headersSignedWith(Buffer.from('x')), secret)
    ).toThrow(PolarWebhookVerificationError);
  });

  it('still rejects a stale timestamp', () => {
    expect(() =>
      validatePolarEvent(body, headersSignedWith(standardKey, 1), secret)
    ).toThrow(PolarWebhookVerificationError);
  });
});
