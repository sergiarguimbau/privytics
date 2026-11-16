/**
 * Build-time download of the GeoLite2 databases into the package directory.
 *
 * Run by `bun run codegen`, so the databases are baked into the Docker image
 * and geolocation works the moment a container starts. `refresh.ts` keeps them
 * current afterwards without needing a rebuild.
 */

import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadDatabases } from './download-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main(): Promise<void> {
  const dest = path.resolve(__dirname, '../');

  if (!fs.existsSync(dest)) {
    console.log('Geo database not found');
    process.exit(1);
  }

  if (!process.env.MAXMIND_LICENSE_KEY) {
    console.warn(
      'MAXMIND_LICENSE_KEY not set: downloading from the community redistribution. ' +
        'A free key from maxmind.com uses the official source and is recommended for production.'
    );
  }

  try {
    // The two databases are independent; download them in parallel.
    await downloadDatabases(dest);
  } catch (error) {
    console.error('Error downloading geo database:', error);
    process.exit(1);
  }
}

main();
