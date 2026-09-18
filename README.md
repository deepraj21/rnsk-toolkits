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
sandbox/             Local UI + server to test toolkits through @rnsk/bot (not published)
.github/             CI, issue/PR templates, CODEOWNERS
CONTRIBUTING.md      Contributor guide
```

Package documentation: [packages/toolkits/README.md](packages/toolkits/README.md)

## Quick start

```bash
git clone https://github.com/deepraj21/rnsk-toolkits.git
cd rnsk-toolkits
npm install
npm run sandbox        # → http://localhost:5173
```

## Sandbox

The sandbox lets toolkit authors test **local, unbuilt** toolkit changes in two ways:

- **Chat:** the real `@rnsk/bot` widget, running the same `searchTool → executeTool` flow as Runstack, with a free Gemini or OpenRouter model.
- **Tool runner:** runs one tool directly, with no LLM.

You can scope both to a single toolkit from the UI. `npm run sandbox:npm` runs the published package instead, for comparison.

See [sandbox/README.md](sandbox/README.md) for setup (all optional), credentials, and the HTTP API.

## Agent skill (skills.sh)

Agents can install the **add-rnsk-toolkit** skill for step-by-step guidance when adding toolkits or tools:

```bash
npx skills add deepraj21/rnsk-toolkits --skill add-rnsk-toolkit -a cursor -y
```

Browse [skills.sh](https://skills.sh) or see [skills/README.md](skills/README.md).

## Typical contributor flow

1. Add a toolkit under `packages/toolkits/src/toolkits/<id>/` (or use the agent skill above)
2. Register the manifest in `packages/toolkits/src/index.ts`
3. `npm run sandbox`, then pick your toolkit with **only** in the sidebar and test it in the Tool runner and Chat
4. `npm run validate && npm run build` in `packages/toolkits`
5. Open a PR

## Versioning

Pre-1.0 (`0.0.x`): patch releases add toolkits and tools. Pin an exact version in production (e.g. `"0.0.4"`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

[SECURITY.md](SECURITY.md)

## License

MIT
