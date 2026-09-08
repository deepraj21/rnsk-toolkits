# @rnsk/toolkits

Open-source toolkit registry for [Runstack](https://github.com/architech-devs/Runstack). Contributors add toolkits as declarative manifests; the production app picks them up via an npm version bump.

## Seed toolkits (v0.0.1)

| Toolkit | Tools | Auth |
|---------|------:|------|
| mathematics | 9 | none |
| linear | 3 | OAuth2 |
| gmail | 3 | OAuth2 |
| web-search (Firecrawl) | 2 | service env (`FIRECRAWL_API_KEY`) |

> **Not** [`@rnsk/tools`](https://www.npmjs.com/package/@rnsk/tools) — that package is the MCP client SDK. This package is the registry *contents*.

## Quick start

```bash
npm install
cd packages/toolkits && npm run build
cd ../sandbox && cp .env.local.example .env.local
# Add OPENROUTER_API_KEY to .env.local
npm run dev
```

Sandbox API:
- `GET /api/toolkits` — list toolkits and tools
- `POST /api/dev-token` — paste OAuth tokens or service env vars for the session
- `POST /api/chat` — stream chat with meta-tools

## Adding a toolkit

1. Create `packages/toolkits/src/toolkits/<id>/` with `manifest.ts`, `icon.ts`, `tools/*.ts`
2. Register the manifest in `src/index.ts`
3. `npm run validate && npm run build`

See `CONTRIBUTING.md` (coming soon) for the full checklist.

## License

MIT
