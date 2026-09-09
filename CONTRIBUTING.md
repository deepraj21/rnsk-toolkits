# Contributing to @rnsk/toolkits

Thank you for helping grow the connector ecosystem for Runstack and the wider agent community.

## What we're building

This repo is a **curated registry** of toolkits — not a dump of every API wrapper. Each toolkit is a manifest plus tools that Runstack (or any consumer) loads from npm. Contributors can:

- Add tools to an existing toolkit
- Ship a **new toolkit** for a service you integrate with
- Host **private toolkits** by publishing your own fork or scoped package, then wiring Runstack to that version

Merging a toolkit does **not** guarantee it is enabled in production Runstack immediately. Toolkits that need OAuth apps or env vars ship as `available: false` until operators configure them.

## Before you start

1. Read [README.md](README.md) for architecture context
2. Search [open issues](https://github.com/deepraj21/rnsk-toolkits/issues) for duplicate work
3. For large toolkits, open an issue first to align on scope and auth approach

## Naming conventions

Follow these naming patterns throughout the codebase:

- **File/directory names**: `kebab-case` (e.g., `web-search/`, `create-draft.ts`, `google-calendar/`)
- **Variables/identifiers**: `camelCase` (e.g., `webSearch`, `googleCalendar`, `createDraft`)
- **Types/interfaces**: `PascalCase` (e.g., `ToolkitManifest`, `OAuthProviderSpec`)

This allows toolkit directory names like `web-search` to be imported as camelCase variables (`webSearch`) since JavaScript doesn't allow hyphens in identifier names.

## Development setup

```bash
npm install
cd packages/toolkits
npm run validate   # manifest + tool shape checks
npm run build
cd ../../sandbox
cp .env.local.example .env.local
npm run dev
```

Use the sandbox to call tools with `POST /api/dev-token` before opening a PR.

## Adding a toolkit

1. Create `packages/toolkits/src/toolkits/<id>/` with:
   - `manifest.ts` — `defineToolkit({ ... })`
   - `icon.ts` — SVG/PNG data URI
   - `tools/*.ts` — one file per tool
   - `tools/index.ts` — export array
2. Register the manifest in `packages/toolkits/src/index.ts`
3. Run `npm run validate && npm run build` in `packages/toolkits`
4. Add a short note in your PR describing auth and required env vars

Copy the nearest existing toolkit (e.g. `notion/` for OAuth, `mathematics/` for no auth) as a template.

## Pull request checklist

- [ ] `npm run validate` passes
- [ ] `npm run build` passes
- [ ] Every tool has an accurate `scope` (`read` | `write` | `delete`)
- [ ] OAuth `allowedHosts` match actual API calls (no user-controlled URLs)
- [ ] Errors return `{ error: string }` instead of throwing into the agent loop
- [ ] New runtime dependencies are justified in the PR description
- [ ] Tool descriptions are useful for LLM tool selection

## Review expectations

| Stage | Target |
|-------|--------|
| Triage | 3 business days |
| First review | 7 business days |
| Release train | Every ~2 weeks |

Maintainers review **every `execute` body** for token exfiltration, SSRF, and scope honesty. PRs with no author response for 30 days may be marked stale.

## Auth modes

| Mode | When to use | Production enablement |
|------|-------------|------------------------|
| `none` | Pure computation | Immediate |
| `service_env` | Shared API key on server | Operator adds env var |
| `oauth2` | Per-user connections | Operator registers OAuth app |

Prefer `service_env` or user-supplied keys when possible — OAuth toolkits need maintainer registration before they go live.

## CODEOWNERS

Toolkit directories can list contributors in `manifest.meta.contributors`. Maintainers own `core/`, `scripts/`, and `.github/`. The published package does not include agent meta-tools.

## Questions

Open a [GitHub Discussion](https://github.com/deepraj21/rnsk-toolkits/discussions) or issue with the `question` label.
