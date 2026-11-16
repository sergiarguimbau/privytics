import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { hyperdxTransport, redactSensitive } from './pino-logger';

describe('redactSensitive', () => {
  it('filters the query of a string url value', () => {
    expect(redactSensitive({ url: '/x?token=abc&foo=1' })).toEqual({
      url: '/x?token=[REDACTED]&foo=1',
    });
  });

  it('covers keys that merely contain url', () => {
    expect(redactSensitive({ requestUrl: '/x?apikey=abc' })).toEqual({
      requestUrl: '/x?apikey=[REDACTED]',
    });
  });

  it('leaves a non-string url value to the existing recursion', () => {
    expect(redactSensitive({ url: { path: '/x', token: 'abc' } })).toEqual({
      url: { path: '/x', token: '[REDACTED]' },
    });
  });

  it('redacts a service account key', () => {
    expect(
      redactSensitive({ serviceAccountKey: '{"private_key":"x"}' })
    ).toEqual({ serviceAccountKey: '[REDACTED]' });
  });

  it('still redacts sensitive keys by name', () => {
    expect(redactSensitive({ authorization: 'Bearer abc', page: 2 })).toEqual({
      authorization: '[REDACTED]',
      page: 2,
    });
  });
});

describe('hyperdxTransport', () => {
  // pino resolves a bare target from the module that called pino(), which
  // in the api image is apps/api — a package that does not install HyperDX.
  it('hands pino an absolute path that exists, not a package name', () => {
    const { target } = hyperdxTransport('info', 'test-service');
    expect(isAbsolute(target)).toBe(true);
    expect(existsSync(target)).toBe(true);
  });
});

describe('interceptProcessOutput in stdout mode', () => {
  // A child process, because interception rewires the process's own streams.
  it('writes every pino line and every raw line to fd 1 exactly once', () => {
    const script = `
      import { createLogger, interceptProcessOutput } from ${JSON.stringify(join(import.meta.dir, 'pino-logger.ts'))};
      import { testCoreConfig } from ${JSON.stringify(join(import.meta.dir, '../test/config-fixture.ts'))};
      const base = testCoreConfig();
      const config = testCoreConfig({
        isProduction: true,
        logging: { ...base.logging, interceptProcessOutput: true },
      });
      const logger = createLogger({ name: 'api', config });
      interceptProcessOutput(config, logger);
      logger.info('pino line');
      process.stdout.write('raw stdout line\\n');
      process.stderr.write('raw stderr line\\n');
    `;
    const child = Bun.spawnSync([process.execPath, '-e', script]);
    const lines = child.stdout
      .toString()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    expect(lines.map(({ msg, source }) => ({ msg, source }))).toEqual([
      { msg: 'pino line', source: undefined },
      { msg: 'raw stdout line', source: 'stdout' },
      { msg: 'raw stderr line', source: 'stderr' },
    ]);
  });
});
