# Privytics

The source for [Privytics](https://privytics.com), a managed, EU-hosted,
privacy-first product-analytics service.

Privytics is built on the open-source
[OpenPanel](https://openpanel.dev) analytics engine and is distributed under the
same licence, the **GNU AGPL-3.0**. In line with the AGPL, this repository is the
corresponding source of the version we operate.

Privytics is an independent service and is **not affiliated with, endorsed by, or
sponsored by OpenPanel**. "OpenPanel" is a trademark of its respective owner and
is used here only to describe the origin of this software.

- Website: <https://privytics.com>
- Docs: <https://privytics.com/docs>
- Upstream engine: <https://github.com/Openpanel-dev/openpanel>
- Upstream docs: <https://openpanel.dev/docs>

## How this fork differs from upstream

This is OpenPanel (currently v3.30.0) with our changes on top:

- Privytics branding (name, logo, teal colours) across the dashboard, emails,
  the AI assistant and the MCP server.
- A permanent **free tier** (10,000 events per month), Privytics pricing,
  paid-only session replay and AI chat, and plan-based data retention.
- Our own marketing, legal, and docs site under `apps/public`.
- The upstream telemetry ping, feedback widget and trial wind-down are removed.

`MODIFICATIONS.md` has the full list. Internal `@openpanel/*` package names are
kept unchanged so our diff on top of upstream stays small.

## Licence and attribution

- `LICENSE.md`, the full GNU AGPL-3.0 licence (unchanged from upstream).
- `MODIFICATIONS.md`, the AGPL modification notice and summary of changes.
- `TRADEMARK.md`, our trademark notice: nominative use of the OpenPanel name, linking to OpenPanel's own guidelines upstream.

## Branch and upstream model

Two branches with distinct jobs:

- **`main`** mirrors OpenPanel's `main` (remote `upstream`). It is a clean,
  read-only copy of upstream. It is never deployed and never receives our commits.
- **`privytics`** is the production branch: an upstream release plus our
  changes (branding, free tier, billing, marketing site, AI cost control).
  Production is built and deployed from here.

Upstream releases are **merged by hand** into `privytics`, following
`docs/upstream-sync.md`. History is never rewritten, so nothing is
force-pushed. Nothing runs on a schedule. There is a manual-trigger workflow
(`.github/workflows/upstream-check.yml`) that counts new `upstream/main`
commits and previews conflicts, but it only runs when you press it, and it
never merges or pushes for real.

That is deliberate. An earlier version synced and force-pushed automatically,
which is unsafe: a "clean" sync only means no textual conflicts, not that the
code still builds, and nothing type-checked the result before it landed on the
production branch. Do **not** merge `privytics` into `main`; keep the mirror
clean.

Production servers pin specific image **digests**, so a new build only reaches
production when you bump the digest. Review or test a build before shipping it,
and never sync and bump a digest on the same day.

## Development

This is a Bun monorepo (apps + packages). It needs Bun 1.4.4 (`.bun-version`)
and Node 24.22.1 (`.nvmrc`). The engine, SDKs, and tracking APIs are documented
upstream at <https://openpanel.dev/docs>. The Privytics billing model is
described in `packages/payments/PRIVYTICS_BILLING.md`.

Run locally (needs Docker):

```bash
bun install
cp .env.example .env
bun run dock:up          # Postgres, ClickHouse, Redis, Redpanda
bun run codegen          # Prisma client + geo data
bun run migrate:deploy   # once, against the local Docker databases
bun run dev              # API + worker (:3333) and dashboard (:3000)
```

The dashboard reads local env from `apps/start/.dev.vars` (Cloudflare dev
override, it takes precedence over the production values in
`apps/start/wrangler.jsonc`) rather than the root `.env`; put
`API_URL=http://localhost:3333` there for local work. `bun run test` runs the
test suites.

Event ingestion runs through Kafka (Redpanda): the API produces every tracked
event to it and the worker consumes it. It is the only events transport, so
`KAFKA_BROKERS` must be set (`.env.example` points it at the local `op-rp`
service from `docker-compose.yml`), and production needs a Redpanda service too.
