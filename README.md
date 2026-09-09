# rnsk-toolkits

Monorepo for [`@rnsk/toolkits`](https://www.npmjs.com/package/@rnsk/toolkits) — an open-source registry of AI agent connectors consumed by [Runstack](https://runstack.engineer).

[![npm version](https://img.shields.io/npm/v/@rnsk/toolkits.svg)](https://www.npmjs.com/package/@rnsk/toolkits)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What this repo is

A place to **build, test, and publish toolkit definitions** — manifests, tool implementations, OAuth specs, and icons. Runstack imports the published npm package and registers tools into its own agent runtime.

> **Not** [`@rnsk/tools`](https://www.npmjs.com/package/@rnsk/tools) — that is the MCP client SDK.

## Repository layout

```
packages/toolkits/   Published npm package (@rnsk/toolkits)
sandbox/             Local HTTP server to invoke tools at runtime
.github/             CI, issue/PR templates, CODEOWNERS
CONTRIBUTING.md      Contributor guide
```

Package documentation: [packages/toolkits/README.md](packages/toolkits/README.md)

## Quick start

```bash
git clone https://github.com/deepraj21/rnsk-toolkits.git
cd rnsk-toolkits
npm install
cd packages/toolkits && npm run validate && npm run build
cd ../../sandbox && cp .env.local.example .env.local
npm run dev
```

## Sandbox

The sandbox is a **runtime test harness** for toolkit authors. It registers tools from `@rnsk/toolkits` and lets you invoke them directly — the same `execute` path Runstack uses after registration, without replicating Runstack's agent loop.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Server status and tool count |
| `/api/toolkits` | GET | List toolkits and tools |
| `/api/tools` | GET | Flat list of registered tools |
| `/api/tools/:toolName` | GET | Tool metadata and input JSON schema |
| `/api/tools/execute` | POST | Run a tool (`{ "toolName": "...", "args": {} }`) |
| `/api/dev-token` | POST | Set session OAuth token or env var for testing |

### Example: run a tool

```bash
# Optional: provide credentials for OAuth tools
curl -X POST http://localhost:3100/api/dev-token \
  -H 'Content-Type: application/json' \
  -d '{"tokenField":"linearToken","token":"lin_api_..."}'

# Execute
curl -X POST http://localhost:3100/api/tools/execute \
  -H 'Content-Type: application/json' \
  -d '{"toolName":"calculateSum","args":{"a":2,"b":3}}'
```

## Typical contributor flow

1. Add a toolkit under `packages/toolkits/src/toolkits/<id>/`
2. Register the manifest in `packages/toolkits/src/index.ts`
3. `npm run validate && npm run build` in `packages/toolkits`
4. Test with the sandbox (`POST /api/tools/execute`)
5. Open a PR

## Versioning

Pre-1.0 (`0.0.x`): patch releases add toolkits and tools. Pin an exact version in production (e.g. `"0.0.3"`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

[SECURITY.md](SECURITY.md)

## License

MIT
