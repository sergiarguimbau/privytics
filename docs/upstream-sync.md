# Syncing with upstream OpenPanel

Privytics is upstream OpenPanel plus our changes. Since the v3.30.0 upgrade the
`privytics` branch carries upstream's history up to the release tag it is based
on, and our changes on top. We stay current by **merging** upstream release
tags into it. We no longer rebase, so history is never rewritten and nothing is
force-pushed.

**This is a manual process, on purpose. Nothing runs on a schedule.** Syncing
happens when you decide to sync. Two things went wrong with an earlier
automated version, and both still matter:

1. **"Clean merge" is not "working code".** Git only checks for textual
   conflicts. Upstream can rename a function our changes call, or change a
   signature, and the merge applies cleanly while the build is broken. The old
   job force-pushed that result to the production branch without running a
   single test.
2. **`merge=ours` must not be used.** It is inverted during a rebase and easy
   to misread during a merge. Resolve `apps/public` by hand. See
   `.gitattributes`.

## Is there anything worth syncing?

```bash
git fetch upstream --tags
git log --oneline privytics..upstream/main
```

That lists every upstream commit not yet merged. If it is quiet, or it only
touches parts of the codebase we do not change, skip the sync. Prefer merging a
release tag (`v3.x.y`) over a moving `main`.

There is also a manual-trigger workflow, `.github/workflows/upstream-check.yml`,
which counts new upstream commits, previews conflicts with a scratch dry run
and opens an issue with the result. It only
ever runs when you press it in the Actions tab.

## Before you start

Production pins image **digests**, so nothing you do here reaches customers
until you deliberately build an image and bump the digest in the app server's
`.env`. That pin is your real safety net. Never bump a digest and merge on the
same day.

Sync when you have a reason: a security fix, a bug you are hitting, or a feature
you want. Drifting further behind costs you a harder merge later, so a quick
look every month or two is worth it even when you do not act on it.

## The merge

Work in a separate worktree so your main checkout is untouched:

```bash
git fetch upstream --tags
git worktree add ../privytics-sync -b sync/<tag> privytics
cd ../privytics-sync
git merge --no-ff --no-commit <tag>
```

Resolve conflicts. The rule for our own files:

- **`apps/public/**`** is ours (our marketing site, not upstream's). Always
  keep our version: `git checkout --ours -- apps/public`, then drop any new
  upstream files under it.
- **Branding, billing, free tier, AI gating, retention** are ours. Keep our
  behaviour, but read upstream's change first, because they may have
  restructured the code around it.
- **Everything else** is upstream's. Prefer their version and re-apply our
  change on top if it is still needed.

Also check what merged *without* a conflict: new upstream screens, emails and
prompts arrive with OpenPanel copy, blue colours and openpanel.dev links.

## Which OpenPanel references to keep

Not every mention of OpenPanel is a branding leak, and "fix them all" is the
wrong instinct. The rule:

> **Product identity is Privytics. Technical reference is OpenPanel.**

**Rewrite to Privytics**: anything describing who the product is, or that a
customer sees as ours:

- UI copy, emails, page titles, the AI assistant's system prompt
  (`packages/core/src/modules/assistant/src/prompt.ts`), the MCP server name
  and the TOTP issuer
- The embeddable badge in `apps/start/src/routes/widget/badge.tsx`, which
  renders on our customers' own websites
- Brand colours (OpenPanel blue to teal), including `chartColors[0]` in
  `packages/core/src/modules/report/report.constants.ts`
- Every install snippet sets `apiUrl` to our ingestion host and loads
  `https://privytics.com/op1.js`
  (`apps/start/src/components/onboarding/install-snippets.ts`)

**Leave pointing at openpanel.dev**: deep technical reference we do not
publish:

- The per-framework SDK links in `packages/sdks/_info/frameworks.tsx`, and the
  engine docs the assistant's `search_docs` tool reads.
- MCP settings docs, and the self-hosting env-var link in the AI chat empty
  state.

One safeguard when linking out: following upstream docs verbatim leaves the
default `apiUrl`, which sends events to OpenPanel's host. The note in
`apps/start/src/components/onboarding/install-manual.tsx` covers the install
guide link today. If you add an outbound OpenPanel link somewhere without that
warning nearby, add one.

**Never restore** (these are not doc links, they are defects):

- The Userjot feedback widget. It sent user id, name and email to a third party
  in neither our Privacy Policy nor our DPA, and the feedback landed on
  OpenPanel's board.
- The upstream telemetry ping to `api.openpanel.dev`.
- Upstream's `windDown` cron, the trial-themed wind-down emails, and the
  save-discount offer in the cancel flow.
- Upstream's model catalog: only our approved models in
  `packages/core/src/modules/assistant/assistant.constants.ts` and
  `assistant/src/providers.ts`.
- Upstream's `sdks.yml` and `self-hosting-release.yml` workflows.

Attribution notices ("runs the open-source OpenPanel engine, not affiliated
with...") are required nominative use and match `TRADEMARK.md`. Keep them.

## Verify before you commit (this is the part that was missing)

```bash
bun install                   # lockfile may have moved
bun run codegen               # Prisma client + generated data
bun run typecheck             # catches renamed/moved APIs our changes call
bun run test                  # unit tests (needs `bun run dock:up`)
cd apps/public && npm run build   # marketing site (npm project, own lockfile)
```

Never run a formatter (`bun run fix`, `ultracite fix`, `biome --write`) as part
of a sync: it rewrites files we have not touched and buries the real diff.

Then run the brand-leak check. These are the exact things that have come back
from upstream before:

```bash
# Should return NOTHING. Any hit is a leak to review against the rules above.
grep -rn "userjot\|window\.uj" --include="*.tsx" --include="*.ts" apps/start/src
grep -rn "ANALYTICS FROM" -A2 apps/start/src/routes/widget/badge.tsx | grep -i openpanel
grep -rn "93c5fd\|3b82f6\|rgb(59 130 246)\|2563EB" --include="*.tsx" --include="*.ts" apps/start/src packages/core/src/modules/report
grep -rn "isSelfHosted ? apiUrl\|openpanel.dev/op1\|api.openpanel.dev\|hello@openpanel" apps/start/src
grep -rn "OpenPanel Cloud, hosted\|api.openpanel.dev/mcp" packages/core/src
```

Then spot-check what a merge cannot check for you:

- Our teal branding survived (no OpenPanel blue crept back in).
- `apps/public/next.config.mjs` still has our `output: 'export'`, not
  upstream's config. Losing it silently breaks the Cloudflare Pages build.
- The free tier (hard cap and paid-only replay at ingestion), the one-project
  limit and the AI gate still behave.
- `CRON_SCHEDULES` lists `dataRetention` and not `windDown`.

Commit the merge, fast-forward `privytics` to it and push. No force-push is
needed.

## Then, and only then, ship

1. Run the **Docker Build and Push** workflow manually.
2. Note the new image digests (the tags are `<branch>-<4-char sha>`).
3. Update `OP_API_IMAGE` / `OP_WORKER_IMAGE` in the app server's `.env`, then
   `./deploy.sh` on that box.
4. Smoke-test using the abbreviated section 5 of the ops LAUNCH checklist.

If something is wrong after a push, `git revert -m 1 <merge commit>`.
Production is unaffected as long as you have not bumped the digest.

## If a sync gets too painful

Our diff is meant to stay small. If a merge starts costing hours, that is a
signal our changes have spread, not that the process is broken. Look for
changes that could move into `apps/public` (which upstream never touches) or
into configuration, rather than into upstream source files.
