# @rnsk/toolkits

Manifest-driven toolkit registry for AI agents — connector definitions you publish as npm and wire into [Runstack](https://runstack.engineer).

[![npm version](https://img.shields.io/npm/v/@rnsk/toolkits.svg)](https://www.npmjs.com/package/@rnsk/toolkits)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

> This is **not** [`@rnsk/tools`](https://www.npmjs.com/package/@rnsk/tools) (the MCP client SDK). `@rnsk/toolkits` ships **connector implementations** — manifests, tools, OAuth specs, and icons.

## What this package contains

| Export | Purpose |
|--------|---------|
| `@rnsk/toolkits` | All toolkit manifests, `registerAllTools()`, `getAllTools()` |
| `@rnsk/toolkits/core` | Types, `defineToolkit`, validation, schema helpers |

## Seed toolkits (v0.0.4)

**228 tools** across **8 toolkits**.

| Toolkit | Tools | Auth |
|---------|------:|------|
| mathematics | 9 | none |
| linear | 8 | OAuth2 |
| gmail | 15 | OAuth2 |
| web-search (Firecrawl) | 2 | service env |
| github | 173 | OAuth2 |
| notion | 8 | OAuth2 |
| google-calendar | 6 | OAuth2 |
| google-sheets | 7 | OAuth2 |

## Install

```bash
npm install @rnsk/toolkits
```

Peer dependencies: `ai`, `zod`.

## Usage

Register every toolkit tool into your application's registry:

```ts
import { toolkits, registerAllTools } from '@rnsk/toolkits';

registerAllTools(myRegistry);
```

Inspect manifests or build custom registration:

```ts
import { toolkits } from '@rnsk/toolkits';
import { defineToolkit, validateManifests } from '@rnsk/toolkits/core';

for (const manifest of toolkits) {
  console.log(manifest.id, manifest.tools.length);
}
```

Runstack loads this package server-side, registers tools, and routes agent requests through its own meta-tool layer. You can publish a **private fork** or scoped package and point Runstack at your version to host connectors outside the public registry.

## Toolkit structure

Each toolkit lives under `src/toolkits/<id>/`:

```
<id>/
  manifest.ts    # defineToolkit({ displayName, auth, tools, ... })
  icon.ts        # SVG/PNG data URI
  tools/
    *.ts         # one tool per file (AI SDK tool() + execute)
    index.ts     # exports array
```

After adding a toolkit, register it in `src/index.ts`, then run `npm run validate && npm run build`.

## Local testing

The repo includes a **sandbox** (not published to npm) for exercising tools at runtime:

```bash
cd ../../sandbox
cp .env.local.example .env.local
npm run dev
```

Use `POST /api/tools/execute` to invoke a tool directly with the same credential-injection pattern Runstack uses. See the [repository README](../../README.md) for sandbox endpoints.

## Versioning

Pre-1.0 (`0.0.x`): patch releases add toolkits and tools. Pin an exact version in production (`"0.0.4"`).

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the repository root.

## Security

Report vulnerabilities privately — [SECURITY.md](../../SECURITY.md). Toolkit `execute` functions run server-side with user credentials; every PR is reviewed for token handling and outbound hosts.

## License

MIT
