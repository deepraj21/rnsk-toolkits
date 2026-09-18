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
npm run sandbox    # → http://localhost:5173, runs your local toolkit source (no build needed)
```

### Test your toolkit in the sandbox

1. Click **only** next to your toolkit in the sidebar to scope everything to it.
2. **Tool runner** tab: run each tool with JSON args. Nothing else is involved, so this is the quickest way to debug.
3. **Chat** tab: talk to the real `@rnsk/bot` (bottom-right). It uses Runstack's meta-tool flow (`searchTool → checkAuthentication → executeTool`). This needs one free key in `sandbox/.env.local`: `GEMINI_API_KEY` or `OPENROUTER_API_KEY`.
4. OAuth toolkits: paste an access token in the **Credentials** panel. Service env toolkits: set the env var in `sandbox/.env.local` or paste it.
5. Optional: `npm run sandbox:npm` to compare against the published `@rnsk/toolkits`.

Saving a file under `packages/toolkits/src` restarts the sandbox automatically. Details are in [sandbox/README.md](sandbox/README.md).

Before opening a PR:

```bash
cd packages/toolkits
npm run validate   # manifest + tool shape checks
npm run build
```

## Agent skill

For AI-assisted contributions, install the repo skill from [skills.sh](https://skills.sh):

```bash
npx skills add deepraj21/rnsk-toolkits --skill add-rnsk-toolkit -a cursor -y
```

See [skills/README.md](skills/README.md) for details.

## Adding a toolkit

1. Create `packages/toolkits/src/toolkits/<id>/` with:
   - `manifest.ts` — `defineToolkit({ ... })`
   - `icon.ts` — SVG/PNG data URI
   - `tools/*.ts` — one file per tool
   - `tools/index.ts` — export array
2. Register the manifest in `packages/toolkits/src/index.ts`
3. Test it with `npm run sandbox` (scope to your toolkit, then use the Tool runner and Chat)
4. Run `npm run validate && npm run build` in `packages/toolkits`
5. Add a short note in your PR describing auth and required env vars

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
