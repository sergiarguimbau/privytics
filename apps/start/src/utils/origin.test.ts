import { describe, expect, it } from 'vitest';
import { toOrigin } from './origin';

describe('toOrigin', () => {
  it.each([
    ['example.com', 'https://example.com'],
    ['https://Example.com/', 'https://example.com'],
    ['https://example.com/shop?utm=x#top', 'https://example.com'],
    ['http://localhost:8080', 'http://localhost:8080'],
    ['localhost:3000', 'http://localhost:3000'],
    ['localhost', 'http://localhost'],
    ['127.0.0.1:5173/app', 'http://127.0.0.1:5173'],
    ['app.localhost:3000', 'http://app.localhost:3000'],
    ['https://localhost:3000', 'https://localhost:3000'],
    ['localhost.example.com', 'https://localhost.example.com'],
    ['*.example.com', 'https://*.example.com'],
    ['*', '*'],
    ['', ''],
  ])('%s becomes %s', (input, expected) => {
    expect(toOrigin(input)).toBe(expected);
  });
});
