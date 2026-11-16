/**
 * Refresh the GeoLite2 databases into a writable directory.
 *
 * Run weekly in production (see privytics-ops/compose/app.yml). The API and
 * worker read GEO_DB_DIR first and fall back to the copy baked into the image,
 * so this can fail without taking geolocation down: worst case the service
 * keeps using build-time data.
 *
 * Why weekly rather than at build time only: MaxMind publishes GeoLite2 twice a
 * week, and the licence expects you to keep current rather than pin a snapshot
 * indefinitely. Erasure requests only reach you through a fresh download.
 *
 * Usage:
 *   GEO_DB_DIR=/data/geo bun scripts/refresh.ts   (or `bun run refresh` in packages/core)
 *
 * Writes atomically: each database downloads to a temporary directory and is
 * renamed into place only once complete, so a reader never sees a half-written
 * file and a failed run leaves the previous copy intact.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { downloadDatabases } from './download-lib';

async function main(): Promise<void> {
  const dest = process.env.GEO_DB_DIR;
  if (!dest) {
    console.error('GEO_DB_DIR is not set. Nothing to refresh.');
    process.exit(1);
  }

  await fsp.mkdir(dest, { recursive: true });

  const staging = await fsp.mkdtemp(path.join(os.tmpdir(), 'geo-refresh-'));
  try {
    await downloadDatabases(staging);

    const files = (await fsp.readdir(staging)).filter((f) =>
      f.endsWith('.mmdb')
    );
    if (files.length === 0) {
      throw new Error('download produced no .mmdb files');
    }

    for (const file of files) {
      const from = path.join(staging, file);
      const to = path.join(dest, file);
      // rename is atomic within a filesystem; copy+rename covers the case
      // where the temp dir and the volume are on different devices.
      try {
        await fsp.rename(from, to);
      } catch {
        const tmpTarget = `${to}.tmp`;
        await fsp.copyFile(from, tmpTarget);
        await fsp.rename(tmpTarget, to);
      }
      const { size } = await fsp.stat(to);
      console.log(`refreshed ${file} (${(size / 1_000_000).toFixed(1)} MB)`);
    }

    console.log(`geo refresh complete: ${files.length} database(s) in ${dest}`);
  } catch (error) {
    // Deliberately non-fatal in spirit: the caller decides. Exit non-zero so a
    // cron wrapper can alert, but the running services keep their current data.
    console.error('geo refresh failed, existing databases left untouched:', error);
    process.exitCode = 1;
  } finally {
    await fsp.rm(staging, { recursive: true, force: true }).catch(() => {});
    if (fs.existsSync(staging)) {
      console.warn('could not clean staging dir', staging);
    }
  }
}

main();
