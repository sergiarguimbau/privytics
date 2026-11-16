// The one client with no `ProviderError`: both lookups read a bundled MaxMind
// `.mmdb`, so an IP the database does not carry comes back as the default value
// and a database that will not load fails identically on every retry.

import { readFile } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ReaderModel } from '@maxmind/geoip2-node';
import { Reader } from '@maxmind/geoip2-node';
import { LRUCache } from 'lru-cache';
import datacenterAsns from './datacenter-asns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Where a `.mmdb` may live, in priority order:
 *
 *   1. GEO_DB_DIR, if set. A writable directory (a mounted volume in
 *      production) that the weekly refresh job (`scripts/refresh.ts`) writes
 *      into. This is what makes the data updatable without rebuilding the
 *      image, which the GeoLite2 licence expects: stale copies must not outlive
 *      their replacements, because right-to-erasure removals only reach you via
 *      a fresh download.
 *   2. The copy baked into the image by `bun run codegen` at build time. This
 *      is the floor: if the refresh job has never run, or the volume is empty,
 *      geolocation still works with build-time data. The api dist bundle layout
 *      comes first (`import.meta.url` is `apps/api/dist/index.js`, three levels
 *      up is the repo root), then the local package (core's own tests and
 *      `bun run src/main.ts`, unbundled).
 */
function candidatePaths(filename: string): string[] {
  const paths: string[] = [];
  // ponytail: Privytics exception to core's R7 (no process.env in core). Plumb
  // GEO_DB_DIR through apps/api/src/config/env.ts and CoreConfig if the geo
  // readers ever become config-constructed clients.
  const overrideDir = process.env.GEO_DB_DIR;
  if (overrideDir) {
    paths.push(path.join(overrideDir, filename));
  }
  // The api dist bundle
  paths.push(path.join(__dirname, `../../../packages/core/${filename}`));
  // The local package
  paths.push(path.join(__dirname, `../../${filename}`));
  return paths;
}

/** Databases that failed to load, for the boot-time health check. */
const missing = new Set<string>();

async function loadDatabase(filename: string): Promise<ReaderModel | null> {
  for (const candidate of candidatePaths(filename)) {
    try {
      const dbBuffer = await readFile(candidate);
      console.log(`${filename} loaded from ${candidate}`);
      missing.delete(filename);
      return Reader.openBuffer(dbBuffer);
    } catch {
      // Try the next candidate.
    }
  }
  missing.add(filename);
  console.error(`${filename} not found`, { tried: candidatePaths(filename) });
  return null;
}

/**
 * Boot-time status of the geo databases.
 *
 * A missing database is otherwise invisible: lookups return undefined, events
 * still ingest, and every visitor silently records with no country. Callers use
 * this to fail loudly at startup instead of discovering it in the dashboard
 * weeks later.
 */
export async function getGeoStatus(): Promise<{
  ok: boolean;
  loaded: string[];
  missing: string[];
}> {
  await Promise.all([getReader(), getAsnReader()]);
  const all = ['GeoLite2-City.mmdb', 'GeoLite2-ASN.mmdb'];
  const missingList = all.filter((name) => missing.has(name));
  return {
    ok: missingList.length === 0,
    loaded: all.filter((name) => !missing.has(name)),
    missing: missingList,
  };
}

let readerPromise: Promise<ReaderModel | null> | null = null;
let asnReaderPromise: Promise<ReaderModel | null> | null = null;

function getReader(): Promise<ReaderModel | null> {
  if (!readerPromise) {
    readerPromise = loadDatabase('GeoLite2-City.mmdb');
  }
  return readerPromise;
}

function getAsnReader(): Promise<ReaderModel | null> {
  if (!asnReaderPromise) {
    asnReaderPromise = loadDatabase('GeoLite2-ASN.mmdb');
  }
  return asnReaderPromise;
}

export interface GeoLocation {
  country: string | undefined;
  city: string | undefined;
  region: string | undefined;
  longitude: number | undefined;
  latitude: number | undefined;
}

const DEFAULT_GEO: GeoLocation = {
  country: undefined,
  city: undefined,
  region: undefined,
  longitude: undefined,
  latitude: undefined,
};

const ignore = ['127.0.0.1', '::1'];

const cache = new LRUCache<string, GeoLocation>({
  max: 1000,
  ttl: 1000 * 60 * 5,
  ttlAutopurge: true,
});

export async function getGeoLocation(ip?: string): Promise<GeoLocation> {
  if (!ip || ignore.includes(ip)) {
    return DEFAULT_GEO;
  }

  const cached = cache.get(ip);
  if (cached) {
    return cached;
  }

  const reader = await getReader();

  try {
    const response = reader?.city(ip);
    const res = {
      city: response?.city?.names.en,
      country: response?.country?.isoCode,
      region: response?.subdivisions?.[0]?.names.en,
      longitude: response?.location?.longitude,
      latitude: response?.location?.latitude,
    };
    cache.set(ip, res);
    return res;
  } catch {
    // Cache negative lookups too: the reader throws AddressNotFoundError for
    // absent IPs and re-throwing on every event is wasted work.
    cache.set(ip, DEFAULT_GEO);
    return DEFAULT_GEO;
  }
}

export interface AsnInfo {
  asn: number | undefined;
  org: string | undefined;
  // True when the ASN belongs to a datacenter / hosting provider.
  isHosting: boolean;
}

const DEFAULT_ASN: AsnInfo = {
  asn: undefined,
  org: undefined,
  isHosting: false,
};

const datacenterAsnSet = new Set<number>(datacenterAsns);

const asnCache = new LRUCache<string, AsnInfo>({
  max: 1000,
  ttl: 1000 * 60 * 5,
  ttlAutopurge: true,
});

export async function getAsnInfo(ip?: string): Promise<AsnInfo> {
  if (!ip || ignore.includes(ip)) {
    return DEFAULT_ASN;
  }

  const cached = asnCache.get(ip);
  if (cached) {
    return cached;
  }

  const reader = await getAsnReader();

  try {
    const response = reader?.asn(ip);
    const asn = response?.autonomousSystemNumber;
    const res: AsnInfo = {
      asn,
      org: response?.autonomousSystemOrganization,
      isHosting: asn !== undefined && datacenterAsnSet.has(asn),
    };
    asnCache.set(ip, res);
    return res;
  } catch {
    // Cache negative lookups too: the reader throws AddressNotFoundError for
    // absent IPs and re-throwing on every event is wasted work.
    asnCache.set(ip, DEFAULT_ASN);
    return DEFAULT_ASN;
  }
}
