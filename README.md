# @rnsk/toolkits

Open-source toolkit registry for AI agents. Build private connectors as npm packages, test them locally, and plug them into [Runstack](https://runstack.engineer) live. Runstack also helps you deploy and test your private connectors and toolkits — and host them for free.

[![npm version](https://img.shields.io/npm/v/@rnsk/toolkits.svg)](https://www.npmjs.com/package/@rnsk/toolkits)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Not** [`@rnsk/tools`](https://www.npmjs.com/package/@rnsk/tools) — that package is the MCP client SDK. `@rnsk/toolkits` is the **registry of connector implementations** (tools, OAuth specs, icons, validation).

## Why this exists

Runstack agents call tools through a shared registry. This package ships **toolkit definitions only** — manifests, tool implementations, OAuth specs, and icons. Agent meta-tools (`searchTool`, `executeTool`, etc.) are implemented in Runstack itself, not in this package.

- **Declarative manifests** — metadata, auth, icons, and tool definitions in one place
- **Schema helpers** — Zod introspection for validation and API serialization
- **A local sandbox** — run and chat against your toolkits before publishing (sandbox includes a dev-only meta-tool shim, not published to npm)

**Typical flow**

1. Fork or clone this repo and add a toolkit under `packages/toolkits/src/toolkits/`
2. Run the sandbox to exercise tools with dev tokens
3. Open a PR; maintainers review security and merge
4. Publish `@rnsk/toolkits` (maintainers)
5. Bump the dependency in your Runstack deployment — new connectors appear without app code changes

## Included toolkits (v0.0.3)

| Toolkit | Tools | Auth |
|---------|------:|------|
| mathematics | 9 | none |
| linear | 3 | OAuth2 |
| gmail | 3 | OAuth2 |
| web-search (Firecrawl) | 2 | service env |
| github | 173 | OAuth2 |
| notion | 8 | OAuth2 |
| google-calendar | 2 | OAuth2 |
| google-sheets | 3 | OAuth2 |

**203 tools** across **8 toolkits**.

## Quick start

```bash
git clone https://github.com/deepraj21/rnsk-toolkits.git
cd rnsk-toolkits
npm install
cd packages/toolkits && npm run build
cd ../../sandbox && cp .env.local.example .env.local
# Add OPENROUTER_API_KEY (and optional toolkit env vars)
npm run dev
```

Sandbox endpoints:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/toolkits` | List toolkits and tools |
| `POST /api/dev-token` | Paste OAuth tokens or service env for the session |
| `POST /api/chat` | Stream chat with meta-tools |

## Use in your own app

```bash
npm install @rnsk/toolkits
```

```ts
import { toolkits, registerAllTools } from '@rnsk/toolkits';

registerAllTools(myRegistry);
```

Runstack consumes this package server-side and wires tools into its own closed-source meta-tool layer. Publish a private fork or scoped npm package, point Runstack at your version, and deploy.

## Project layout

```
packages/toolkits/     Published npm package (@rnsk/toolkits) — manifests + tools only
sandbox/               Local dev server (includes sandbox-only meta-tool shim for testing)
.github/               CI, issue/PR templates, CODEOWNERS
CONTRIBUTING.md        How to add a toolkit
```

## Versioning

Pre-1.0 (`0.0.x`): patch releases add toolkits and tools. Pin an exact version in production (`"0.0.3"`).

## Contributing

We welcome toolkit PRs. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the checklist, review expectations, and sandbox workflow.

## Security

Report vulnerabilities privately — see [SECURITY.md](SECURITY.md). Toolkit `execute` functions run server-side with user OAuth tokens; every PR is reviewed for token handling and outbound hosts.

## License

MIT — see [LICENSE](LICENSE).
