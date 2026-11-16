# Modifications

Privytics is an independent, commercially hosted service built on the
open-source **OpenPanel** analytics engine
(https://github.com/Openpanel-dev/openpanel), which is licensed under the
GNU AGPL-3.0.

Privytics is not affiliated with, endorsed by, or sponsored by OpenPanel.
"OpenPanel" is a trademark of its respective owner and is used here only to
factually describe the origin of this software.

In accordance with the AGPL-3.0, the complete corresponding source code of the
version we operate is published at:
https://github.com/sergiarguimbau/privytics

## Summary of changes from upstream

- Rebranded the dashboard and transactional emails to Privytics (name, logo,
  teal colours, domain, page titles). Internal `@openpanel/*` package names are
  unchanged.
- Replaced OpenPanel's marketing site at `apps/public` with Privytics's own
  marketing, legal, and docs site.
- Repointed every first-party service reference from `openpanel.dev` to
  Privytics hosts: the web install snippet, tracking script (`op1.js`), SDK and
  proxy defaults, dashboard and share-page URLs, support and sender emails,
  notification bot identity, the API error page, health check, and outbound
  user agents. The install snippet now always sends events to our ingestion
  host so no data is routed to OpenPanel.
- Removed OpenPanel's own promotional surfaces from the app: the "Support
  OpenPanel" sponsorship prompt, the OpenPanel Cloud and competitor-comparison
  links, and OpenPanel's social links and company address in email templates.
- Removed the upstream telemetry ping that POSTed the organization's domain and
  total event count to `api.openpanel.dev` (disabled in
  `packages/core/src/modules/misc/misc.service.ts`).
- Removed the Userjot feedback widget (upstream's
  `apps/start/src/components/feedback-widget-scripts.tsx`), which sent user id,
  name and email to a third party; feedback is a plain email link instead.
- Removed upstream's trial wind-down cron, which could block ingestion and
  schedule an organization's data for deletion, and the save-discount offer in
  the cancel flow. Privytics has no trial.
- The AI assistant, MCP server and two-factor issuer identify as Privytics, and
  the assistant points customers at Privytics support and hosts.
- Kept links to OpenPanel's documentation intact as nominative references: the
  shared SDK, MCP, and self-hosting guides point to `openpanel.dev/docs`.
  Getting-started and install pages point to our own docs so they show the
  correct ingestion host. Self-hosting the fork remains supported (the
  `SELF_HOSTED` code path is unchanged).
- Added a permanent free tier and Privytics pricing: 10,000 events a month for
  a user's first organization, hard-capped at ingestion, with session replay
  and the AI chat on paid plans only.
- Added plan-based data retention: 12 months on the free plan, 5 years on paid
  plans.
- Added per-stack setup guides under `/for` (17 SDKs and 4 project types) on the
  marketing site, written from the upstream OpenPanel SDK docs and verified
  against the published packages. `llms.txt` is generated from the same content
  so it cannot drift from the pages that actually exist.
- Pinned the worker's cron patterns to UTC (`packages/core/src/jobs/schedulers.ts`). The salt-rotation job previously
  followed the host timezone, which would have made the published "rotates at
  midnight UTC" claim depend on server configuration.
- Deployment and operations configuration is maintained in a separate,
  arm's-length repository.

## Copyright

- Original work: Copyright (c) OpenPanel contributors. Licensed under AGPL-3.0.
- Modifications: Copyright (c) 2026 Privytics. Licensed under AGPL-3.0.

First modified: 2026-07.
