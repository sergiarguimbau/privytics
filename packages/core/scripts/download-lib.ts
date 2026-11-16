/**
 * Shared GeoLite2 download logic, used by both `download-geo.ts` (build time, into
 * the package directory) and `refresh.ts` (runtime, into a mounted volume).
 *
 * Source depends on MAXMIND_LICENSE_KEY:
 *   - set:   MaxMind's official endpoint. Preferred. The key is free.
 *   - unset: a community redistribution of the same databases. Works, but the
 *            build then depends on a third-party mirror staying available.
 *
 * Either way the data is GeoLite2 by MaxMind and its attribution requirement
 * applies; the site carries that notice in the footer.
 */

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import zlib from 'node:zlib';
import * as tar from 'tar';

// GeoLite2-City → geo lookups; GeoLite2-ASN → datacenter/hosting detection.
export const DATABASES = ['GeoLite2-City', 'GeoLite2-ASN'] as const;

export function editionUrl(db: string): string {
  if (process.env.MAXMIND_LICENSE_KEY) {
    return [
      'https://download.maxmind.com/app/geoip_download',
      `?edition_id=${db}&license_key=${process.env.MAXMIND_LICENSE_KEY}&suffix=tar.gz`,
    ].join('');
  }
  return `https://raw.githubusercontent.com/GitSquared/node-geolite2-redist/master/redist/${db}.tar.gz`;
}

/** Max redirect hops before giving up, to avoid a redirect loop hanging a build. */
const MAX_REDIRECTS = 5;

export async function downloadDb(
  db: string,
  dest: string,
  url: string = editionUrl(db),
  redirectsLeft: number = MAX_REDIRECTS
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = https.get(url, (res) => {
      // MaxMind's official endpoint answers 302 with a signed CDN URL; only
      // the community mirror serves the tarball directly. https.get does not
      // follow redirects on its own, so without this a licensed download fails
      // with "HTTP 302" while the keyless path silently kept working.
      const status = res.statusCode ?? 0;
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        if (redirectsLeft <= 0) {
          reject(new Error(`Too many redirects for ${db}`));
          return;
        }
        const next = new URL(res.headers.location, url).toString();
        downloadDb(db, dest, next, redirectsLeft - 1).then(resolve, reject);
        return;
      }

      if (status !== 200) {
        res.resume();
        // Never echo the URL: it carries the licence key as a query parameter.
        reject(new Error(`Download failed for ${db}: HTTP ${status}`));
        return;
      }

      const gunzip = zlib.createGunzip();
      const parser = tar.t();
      // Each extracted .mmdb write must flush before we report success, or an
      // early exit can leave a truncated database on disk.
      const writes: Promise<void>[] = [];

      parser.on('entry', (entry) => {
        if (entry.path.endsWith('.mmdb')) {
          const filename = path.join(dest, path.basename(entry.path));
          const file = fs.createWriteStream(filename);
          writes.push(
            new Promise<void>((writeDone, writeFailed) => {
              file.on('finish', writeDone);
              file.on('error', writeFailed);
            })
          );
          entry.pipe(file);

          console.log('Saved geo database:', filename);
        } else {
          entry.resume();
        }
      });

      // pipe() does not forward errors, so each stage needs its own handler.
      gunzip.on('error', reject);
      parser.on('error', reject);
      parser.on('finish', () => {
        Promise.all(writes).then(() => resolve(), reject);
      });

      res.pipe(gunzip).pipe(parser as never);
    });

    request.on('error', reject);
  });
}

/** Download every database in parallel; they are independent. */
export async function downloadDatabases(dest: string): Promise<void> {
  await Promise.all(DATABASES.map((db) => downloadDb(db, dest)));
}
