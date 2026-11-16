// Content guardrail, run before every build (see package.json).
//
// Enforces two editorial policies that keep regressing:
//
// 1. No hosting-provider brand anywhere public. Infrastructure is deliberately
//    described only as "EU data centres in Germany" so published copy and legal
//    text never depend on which provider we happen to run on.
//
// 2. No self-undermining framing in MARKETING content. "sole trader" and
//    "pre-launch" are banned from content/ (blog articles, /for guides) and
//    marketing components. The legal pages (app/legal/content.json) are
//    deliberately EXEMPT from this rule: the Terms and DPA identify the
//    contracting party as "a sole trader (autónomo)", which is the operator's
//    real legal form and must stay accurate there.
//
// Also bans em-dashes in content files (house style).

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.join(ROOT, '..');

const TEXT_EXT = new Set(['.md', '.json', '.ts', '.tsx', '.mjs', '.txt']);
const LEGAL_FILE = path.join('app', 'legal', 'content.json');

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (TEXT_EXT.has(path.extname(entry.name))) yield full;
  }
}

const violations = [];

for (const dir of ['content', 'app'].map((d) => path.join(APP_DIR, d))) {
  for (const file of walk(dir)) {
    const rel = path.relative(APP_DIR, file);
    const text = fs.readFileSync(file, 'utf8');
    const isLegal = rel === LEGAL_FILE;
    const isContent = rel.startsWith('content' + path.sep);
    const isThisScript = rel.startsWith('scripts' + path.sep);
    if (isThisScript) continue;

    // Rule 1: provider brands, everywhere.
    for (const m of text.matchAll(/hetzner|greencloud/gi)) {
      violations.push(`${rel}: provider brand "${m[0]}"`);
    }

    // Rule 2: credibility framing, marketing content only (legal exempt).
    if (!isLegal) {
      for (const m of text.matchAll(/sole[ -]trader|pre-?launch/gi)) {
        violations.push(`${rel}: banned framing "${m[0]}"`);
      }
    }

    // Rule 3: em-dashes in content files.
    if (isContent && text.includes('—')) {
      const count = text.split('—').length - 1;
      violations.push(`${rel}: ${count} em-dash(es)`);
    }
  }
}

if (violations.length > 0) {
  console.error('Content policy violations:\n');
  for (const v of violations) console.error('  - ' + v);
  console.error(`\n${violations.length} violation(s). Fix before building.`);
  process.exit(1);
}

console.log('content check passed');
