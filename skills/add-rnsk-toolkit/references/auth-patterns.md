# Auth patterns for @rnsk/toolkits

## OAuth2 (per-user)

Used by: Linear, Gmail, GitHub, Notion, Google * toolkits.

```typescript
auth: {
  type: 'oauth2',
  tokenField: 'linearToken',
  provider: {
    slug: 'linear',
    env: { clientId: 'LINEAR_CLIENT_ID', clientSecret: 'LINEAR_CLIENT_SECRET' },
    authorizeUrl: 'https://linear.app/oauth/authorize',
    tokenUrl: 'https://api.linear.app/oauth/token',
    scopes: ['read', 'write'],
    scopeSeparator: ',',          // optional; default space-separated
    exchangeStyle: 'form',        // 'form' | 'json' | 'basic'
    connectDescription: '...',
    callbackPath: '/api/auth/linear/callback',
    stateCookie: 'linear_oauth_state',
  },
},
allowedHosts: ['api.linear.app'],
```

Every authed tool must set `requiredAuth: 'linearToken'` matching `tokenField`.

## service_account (structured credentials)

Used by: AWS, GCP, Grafana.

```typescript
auth: {
  type: 'service_account',
  tokenField: 'grafanaCredentials',
  provider: {
    fields: ['baseUrl', 'apiToken'],
    connectDescription: 'Connect with base URL and optional API token.',
  },
},
```

Tools receive `grafanaCredentials` as a JSON string:

```typescript
export function parseGrafanaCredentials(raw: string) {
  const parsed = JSON.parse(raw);
  if (!parsed.baseUrl) throw new Error('baseUrl required');
  return { baseUrl: parsed.baseUrl.replace(/\/+$/, ''), apiToken: parsed.apiToken };
}
```

## service_env (server-side key)

Used by: web-search (Firecrawl).

```typescript
auth: {
  type: 'service_env',
  env: [{ name: 'FIRECRAWL_API_KEY', description: 'Firecrawl API key' }],
},
```

Tools read `process.env.FIRECRAWL_API_KEY` inside execute (no tokenField on tools).

## none

Used by: mathematics.

No `requiredAuth` on tools. Omit auth provider block:

```typescript
auth: { type: 'none' },
```

## allowedHosts

Required for OAuth toolkits. List every hostname tools call (no user-controlled hosts). Prevents SSRF in hosted Runstack.

Skip for self-hosted service_account toolkits where base URL is user-supplied (AWS/GCP/Grafana pattern).

## Scope selection

| scope | Use when |
|-------|----------|
| `read` | GET, list, search, fetch |
| `write` | create, update, send, post, set |
| `delete` | delete, remove, cancel |

Prefer explicit scope in `tools/index.ts`. Fallback: `inferToolScope(name)` in manifest map.
