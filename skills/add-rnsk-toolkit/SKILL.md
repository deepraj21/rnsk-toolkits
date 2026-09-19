---
name: add-rnsk-toolkit
description: >-
  Add or extend toolkits and tools in @rnsk/toolkits (Runstack connector registry).
  Use when creating a new toolkit under packages/toolkits/src/toolkits/, adding tools
  to an existing toolkit, implementing manifest.ts/icon.ts/tools, registering in
  index.ts, or when a user references toolkit-todo-list JSON as a tool spec.
license: MIT
compatibility: Requires access to packages/toolkits in the rnsk-toolkits monorepo. Node.js for npm run validate && npm run build.
metadata:
  author: deepraj21
  repository: https://github.com/deepraj21/rnsk-toolkits
  version: "1.0.0"
---

# Add @rnsk/toolkit Tools

Guide for agents contributing connectors to [`@rnsk/toolkits`](https://github.com/deepraj21/rnsk-toolkits).

## When to use

- User asks to add a **new toolkit** (e.g. Grafana, Google Forms)
- User asks to add **tools** to an existing toolkit
- User provides `toolkit-todo-list/*.json` or `all_tools.json` as a **reference only** (implement real API calls, do not import JSON at runtime)
- User mentions Runstack connectors, manifest-driven tools, or `defineToolkit`

## Repo layout

```
packages/toolkits/src/
  index.ts                 # register every manifest here
  core/                    # types, validate, defineToolkit — do not edit unless required
  toolkits/<id>/
    manifest.ts
    icon.ts
    tools/
      index.ts             # exports `<id>Tools` array
      *.ts                 # one tool per file
      utils.ts | client.ts # optional shared HTTP/SDK helper
```

## Decision tree

**New service / new auth?** → New toolkit directory + register in `index.ts`

**Same service, more endpoints?** → Add tool file(s) + update `tools/index.ts` (+ manifest if auth/scopes change)

## New toolkit workflow

Copy the nearest existing toolkit:

| Auth | Copy from |
|------|-----------|
| OAuth2 | `google-docs/`, `notion/`, `linear/` |
| bearer_token | `groww/` |
| service_account | `aws/`, `gcp/`, `grafana/` |
| service_env | `web-search/` |
| none | `mathematics/` |

### Checklist

```
- [ ] Create packages/toolkits/src/toolkits/<id>/
- [ ] manifest.ts — defineToolkit({ id, displayName, shortDescription, category, icon, auth, tools, meta })
- [ ] icon.ts — SVG base64 data URI (GFORMS_ICON pattern)
- [ ] tools/*.ts — one AI SDK tool per file (or group related tools by domain, e.g. `orders.ts` in `groww/`)
- [ ] tools/index.ts — export array with name, description, tool, requiredAuth, scope
- [ ] Register import + export + toolkits[] in src/index.ts
- [ ] npm run validate && npm run build (in packages/toolkits)
```

### Naming rules (enforced by validate.ts)

| Item | Rule | Example |
|------|------|---------|
| Toolkit `id` | kebab-case | `google-forms` |
| Toolkit import var | camelCase | `googleForms` |
| Tool `name` | `<Prefix><Action>` PascalCase after prefix | `googleFormsGetForm` |
| Tool prefix | PascalCase of toolkit id | `google-forms` → `GoogleForms` |
| Files/dirs | kebab-case | `get-form.ts` |
| Legacy exception | `google-calendar` tools omit prefix (`listEvents`) — **do not use for new toolkits** |

Categories must be one of `CONNECTOR_CATEGORIES` in `src/core/categories.ts`.

## Tool file pattern

Every tool uses Vercel AI SDK `tool()` + Zod + safe error returns:

```typescript
// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const myAction = tool({
    description: 'Clear LLM-facing description of when to use this tool.',
    inputSchema: z.object({
        myServiceToken: z.string().optional().describe('Injected auth token — match manifest tokenField'),
        id: z.string().describe('Resource identifier'),
        payload: z.record(z.any()).optional().describe('Complex nested API body'),
    }),
    execute: async ({ myServiceToken, id, payload }) => {
        try {
            const response = await fetch(`https://api.example.com/v1/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${myServiceToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const details = await response.json().catch(() => ({}));
                return { error: 'Failed to perform action', details };
            }

            return await response.json();
        } catch (error) {
            return {
                error: 'Error performing action',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
```

### Tool rules

1. **Never throw** from `execute` — return `{ error: string, details?, message? }`
2. **Include auth field** in `inputSchema` when `requiredAuth` is set (name must match `manifest.auth.tokenField`)
3. **Declare scope** explicitly in `tools/index.ts`: `read` | `write` | `delete`
4. **Descriptions** must help LLM tool selection (what + when)
5. **Minimize scope** — only implement requested tools; match surrounding style
6. Use `z.record(z.any())` or `z.array(z.record(z.any()))` for complex API payloads
7. Put shared fetch logic in `tools/utils.ts` or `tools/client.ts`

## manifest.ts pattern

```typescript
import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { MY_ICON } from './icon.js';
import { myTools } from './tools/index.js';

export default defineToolkit({
  id: 'my-service',
  displayName: 'My Service',
  shortDescription: 'One-line summary for connector catalog.',
  category: 'Developer Tools & DevOps',
  icon: MY_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'myServiceToken',
    provider: {
      slug: 'my-service',
      env: { clientId: 'MY_SERVICE_CLIENT_ID', clientSecret: 'MY_SERVICE_CLIENT_SECRET' },
      authorizeUrl: 'https://...',
      tokenUrl: 'https://...',
      scopes: ['scope'],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect My Service to ...',
      callbackPath: '/api/auth/my-service/callback',
      stateCookie: 'my_service_oauth_state',
    },
  },
  allowedHosts: ['api.example.com'],
  tools: myTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: { since: '0.0.6' },
});
```

### Auth types

| type | tokenField value | provider shape |
|------|------------------|----------------|
| `oauth2` | e.g. `googleFormsToken` | `provider.env`, scopes, callbackPath (see manifest pattern above) |
| `bearer_token` | e.g. `growwAccessToken` | `{ connectDescription }` only — tool code attaches `Authorization: Bearer <token>` itself (see `groww/`) |
| `api_key` | e.g. `myServiceApiKey` | `{ in: 'header' \| 'query', name: 'X-API-Key', prefix?: 'Bearer', connectDescription }` — tool code attaches the key itself |
| `basic_auth` | e.g. `myServiceCredentials` | `{ connectDescription }` only — tokenField holds raw `'username:password'` string |
| `service_account` | e.g. `grafanaCredentials` | `{ fields: ['baseUrl','apiToken'], connectDescription }` — JSON keys user supplies |
| `service_env` | N/A | `env: [{ name: 'FIRECRAWL_API_KEY' }]` |
| `none` | omit requiredAuth | pure computation |

```typescript
// bearer_token (per-user token pasted at connect time) — see groww/manifest.ts
auth: {
  type: 'bearer_token',
  tokenField: 'growwAccessToken',
  provider: {
    connectDescription:
      'Connect Groww with a Trading API access token. Generate one from Groww Profile > Settings > Trading APIs (expires daily at 6:00 AM). All trading calls send it as Authorization: Bearer <token> with X-API-VERSION: 1.0.',
  },
},
allowedHosts: ['api.groww.in'],
```

```typescript
// api_key (per-user key sent as a named header or query param)
auth: {
  type: 'api_key',
  tokenField: 'myServiceApiKey',
  provider: {
    in: 'header',
    name: 'X-API-Key',
    connectDescription: 'Paste your API key from My Service > Settings > API.',
  },
},
```

Tools in a `bearer_token` / `api_key` / `basic_auth` toolkit declare the injected
field as **optional** (`z.string().optional()`); the host injects it at runtime.
A toolkit may mix authed and public tools — omit `requiredAuth` on the public ones
(e.g. `growwSearchInstruments` has no `requiredAuth` while every other Groww tool
sets `requiredAuth: 'growwAccessToken'`).

For `service_account`, tools receive a **JSON string**; parse in `client.ts` (see `aws/tools/client.ts`).

## tools/index.ts pattern

```typescript
// @ts-nocheck
import { myAction } from './my-action.js';

export { myAction };

export const myServiceTools = [
    {
        name: 'myServiceMyAction',
        description: 'Same description as tool() or expanded.',
        tool: myAction,
        requiredAuth: 'myServiceToken' as const,
        scope: 'read' as const,
    },
];
```

## Using toolkit-todo-list JSON

When the user provides Composio-style JSON (`slug`, `input_parameters`, `description`):

1. Read each item's `name`, `description`, `input_parameters`, `scopes`
2. Map to real HTTP/SDK calls (search API docs if endpoints are not in JSON)
3. Normalize param names to **camelCase** in Zod schemas
4. Do **not** commit JSON as runtime config unless explicitly asked — keep as author reference only

## Register in index.ts

```typescript
import myService from './toolkits/my-service/manifest.js';

export const toolkits: ToolkitManifest[] = [
  // ...existing
  myService,
];

export { /* ...existing */, myService };
```

Import order: keep alphabetical or grouped with similar toolkits.

## Verify

```bash
cd packages/toolkits
npm run validate   # manifest rules + Zod inputSchema presence
npm run build      # tsc + ESM dist check
```

Fix validation errors before finishing:

- Duplicate tool names across toolkits
- `requiredAuth` mismatch with `tokenField`
- Invalid category
- Empty JSON schema (missing inputSchema)
- Tool name prefix mismatch

## Local test (optional but recommended)

From repo root:

```bash
npm run sandbox   # http://localhost:5173
```

Scope sidebar to your toolkit → **Tool runner** for direct execute → **Chat** for agent flow.

## PR notes for the user

Include in summary: auth type, env vars, OAuth callback path, `allowedHosts`, and tool count.

## Additional references

- Auth and manifest field details: [references/auth-patterns.md](references/auth-patterns.md)
- Copy-paste templates: [references/templates.md](references/templates.md)
- Human contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)
