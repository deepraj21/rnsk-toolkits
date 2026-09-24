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

## Toolkits

**3639 tools** across **63 toolkits** (run `npm run validate` for live counts).

| Toolkit | Tools | Auth |
|---------|------:|------|
| mathematics | 9 | none |
| linear | 8 | OAuth2 |
| gmail | 61 | OAuth2 |
| web-search (Firecrawl) | 2 | service env |
| github | 173 | OAuth2 |
| notion | 57 | OAuth2 |
| google-calendar | 6 | OAuth2 |
| google-sheets | 7 | OAuth2 |
| google-drive | 10 | OAuth2 |
| google-docs | 10 | OAuth2 |
| google-maps | 20 | OAuth2 |
| google-photos | 13 | OAuth2 |
| google-contacts | 24 | OAuth2 |
| google-forms | 10 | OAuth2 |
| google-meet | 15 | OAuth2 |
| google-slides | 8 | OAuth2 |
| google-classroom | 62 | OAuth2 |
| google-tasks | 15 | OAuth2 |
| google-search-console | 9 | OAuth2 |
| google-analytics | 67 | OAuth2 |
| google-ads | 28 | OAuth2 |
| youtube | 49 | OAuth2 |
| figma | 52 | OAuth2 |
| aws | 855 | service account |
| azure | 52 | service account |
| gcp | 6 | service account |
| grafana | 11 | service account |
| new-relic | 158 | API key |
| npm | 12 | API key |
| accuweather | 41 | API key |
| telegram | 18 | API key |
| snowflake | 16 | service account |
| gumroad | 7 | OAuth2 |
| razorpay | 42 | basic auth |
| prometheus | 37 | service account |
| docker-hub | 20 | service account |
| reddit | 21 | OAuth2 |
| groww | 30 | bearer token |
| cloudflare | 20 | API key |
| slack | 159 | OAuth2 |
| discord | 23 | OAuth2 |
| convex | 19 | bearer token |
| datadog | 61 | service account |
| gitlab | 25 | OAuth2 |
| bitbucket | 108 | OAuth2 |
| hugging-face | 135 | OAuth2 |
| hostinger | 24 | API key |
| hacker-news | 14 | none |
| jira | 103 | OAuth2 |
| neo4j | 21 | basic auth |
| neon | 110 | API key |
| kaggle | 35 | basic auth |
| kubernetes | 43 | service account |
| dev-to | 28 | API key |
| notebook-lm | 11 | OAuth2 |
| nasa | 136 | API key |
| vercel | 147 | OAuth2 |
| zoho | 57 | OAuth2 |
| wordpress | 10 | OAuth2 |
| wise | 9 | API key |
| servicenow | 145 | service account |
| postman | 126 | API key |
| splunk | 29 | service account |

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
    client.ts    # optional: shared credential/SDK client helper (e.g. aws, gcp)
    <group>/*.ts # optional: tools grouped into subfolders by service (e.g. github, aws, gcp)
```

After adding a toolkit, register it in `src/index.ts`, then run `npm run validate && npm run build`.

## Local testing

The repo includes a **sandbox** (not published to npm). It runs this package's source directly, so you don't need to build first. Test it through the real `@rnsk/bot` chat or a direct Tool runner, scoped to one toolkit:

```bash
# from the repo root
npm run sandbox       # → http://localhost:5173
```

See [sandbox/README.md](../../sandbox/README.md).

## Versioning

Pre-1.0 (`0.0.x`): patch releases add toolkits and tools. Pin an exact version in production (`"0.0.6"`).

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the repository root.

## Security

Report vulnerabilities privately — [SECURITY.md](../../SECURITY.md). Toolkit `execute` functions run server-side with user credentials; every PR is reviewed for token handling and outbound hosts.

## License

[MIT](https://github.com/deepraj21/rnsk-toolkits/blob/main/LICENSE)