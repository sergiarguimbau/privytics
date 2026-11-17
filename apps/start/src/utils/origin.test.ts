import { describe, expect, it } from 'vitest';
import { toOrigin } from './origin';

describe('toOrigin', () => {
  it.each([
    ['example.com', 'https://example.com'],
    ['https://Example.com/', 'https://example.com'],
    ['https://example.com/shop?utm=x#top', 'https://example.com'],
    ['http://localhost:8080', 'http://localhost:8080'],
    ['*.example.com', 'https://*.example.com'],
    ['*', '*'],
    ['', ''],
  ])('%s becomes %s', (input, expected) => {
    expect(toOrigin(input)).toBe(expected);
  });
});
