# @rnsk/toolkits

Open-source toolkit registry for AI agents. Build private connectors as npm packages, test them locally, and plug them into [Runstack](https://runstack.engineer) live. Runstack also helps you deploy and test your private connectors and toolkits — and host them for free.

[![npm version](https://img.shields.io/npm/v/@rnsk/toolkits.svg)](https://www.npmjs.com/package/@rnsk/toolkits)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why this exists

Runstack agents call tools through a shared registry. This package ships **toolkit definitions only** — manifests, tool implementations, OAuth specs, and icons. Agent meta-tools (`searchTool`, `executeTool`, etc.) are implemented in Runstack itself, not in this package.

- **Declarative manifests** — metadata, auth, icons, and tool definitions in one place
- **Schema helpers** — Zod introspection for validation and API serialization

## Use in your own app

```bash
npm install @rnsk/toolkits
```

```ts
import { toolkits, registerAllTools } from '@rnsk/toolkits';

registerAllTools(myRegistry);
```

Runstack consumes this package server-side and wires tools into its own closed-source meta-tool layer. Publish a private fork or scoped npm package, point Runstack at your version, and deploy.

## Versioning

Pre-1.0 (`0.0.x`): patch releases add toolkits and tools. Pin an exact version in production (`"0.0.3"`).

## Contributing

We welcome toolkit PRs. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the checklist, review expectations, and sandbox workflow.

## Security

Report vulnerabilities privately — see [SECURITY.md](SECURITY.md). Toolkit `execute` functions run server-side with user OAuth tokens; every PR is reviewed for token handling and outbound hosts.

## License

MIT — see [LICENSE](LICENSE).
