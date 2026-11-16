import { defineConfig } from 'tsup';
import pkg from './package.json';

// The SDK stamps its version into the `openpanel-sdk-version` header via
// `process.env.WEB_VERSION` / `process.env.SDK_VERSION`. `process` does not
// exist in a browser, so any standalone browser bundle MUST substitute these at
// build time. Without it op1.js throws "process is not defined" on load and
// silently collects nothing. Workspace versions carry a `-local` suffix that
// has no business being reported by a shipped tracker.
const SDK_VERSION = JSON.stringify(pkg.version.replace(/-local$/, ''));

export default defineConfig([
  // Library build (npm package) — cjs + esm + dts
  // Dynamic import('./replay') is preserved; the host app's bundler
  // will code-split it into a separate chunk automatically.
  {
    entry: ['index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: true,
    sourcemap: false,
    clean: true,
    minify: true,
  },
  // IIFE build (script tag: op1.js)
  // __OPENPANEL_REPLAY_URL__ is injected at build time so the IIFE
  // knows to load the replay module from the CDN instead of a
  // relative import (which doesn't work in a standalone script).
  // The replay module is excluded via an esbuild plugin so it is
  // never bundled into op1.js — it will be loaded lazily via <script>.
  {
    entry: { 'src/tracker': 'src/tracker.ts' },
    format: ['iife'],
    splitting: false,
    sourcemap: false,
    minify: true,
    define: {
      __OPENPANEL_REPLAY_URL__: JSON.stringify(
        'https://privytics.com/op1-replay.js'
      ),
      'process.env.WEB_VERSION': SDK_VERSION,
      'process.env.SDK_VERSION': SDK_VERSION,
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    esbuildPlugins: [
      {
        name: 'exclude-replay-from-iife',
        setup(build) {
          // Intercept any import that resolves to the replay module and
          // return an empty object. The actual loading happens at runtime
          // via a <script> tag (see loadReplayModule in index.ts).
          build.onResolve(
            { filter: /[/\\]replay([/\\]index)?(\.[jt]s)?$/ },
            () => ({
              path: 'replay-empty-stub',
              namespace: 'replay-stub',
            })
          );
          build.onLoad({ filter: /.*/, namespace: 'replay-stub' }, () => ({
            contents: 'module.exports = {}',
            loader: 'js',
          }));
        },
      },
    ],
  },
  // Replay module — built as both ESM (npm) and IIFE (CDN).
  // ESM  → consumed by the host-app's bundler via `import('./replay')`.
  // IIFE → loaded at runtime via a classic <script> tag (no CORS issues).
  //        Exposes `window.__openpanel_replay`.
  // rrweb must be bundled in (noExternal) because browsers can't resolve
  // bare specifiers like "rrweb" from a standalone ES module / script.
  {
    entry: { 'src/replay': 'src/replay/index.ts' },
    format: ['esm', 'iife'],
    globalName: '__openpanel_replay',
    splitting: false,
    sourcemap: false,
    minify: true,
    noExternal: ['rrweb', '@rrweb/types'],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.WEB_VERSION': SDK_VERSION,
      'process.env.SDK_VERSION': SDK_VERSION,
      // postcss ships a warning branch that reads process.env.LANG. It is dead
      // code in a browser, but an unreplaced `process` is a ReferenceError
      // waiting for whoever trips that path.
      'process.env.LANG': JSON.stringify(''),
    },
  },
]);
