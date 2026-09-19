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

## bearer_token (per-user token)

Used by: Groww.

```typescript
auth: {
  type: 'bearer_token',
  tokenField: 'growwAccessToken',
  provider: {
    connectDescription: 'Paste your Trading API access token (expires daily at 6:00 AM).',
  },
},
allowedHosts: ['api.groww.in'],
```

Tool code attaches the header itself (plus any service headers, e.g. `X-API-VERSION`):

```typescript
headers: {
  Accept: 'application/json',
  Authorization: `Bearer ${growwAccessToken}`,
  'X-API-VERSION': '1.0',
},
```

Every authed tool sets `requiredAuth: 'growwAccessToken'` matching `tokenField`.
Tools declare the injected field as optional: `z.string().optional()`.
Public tools in the same toolkit simply omit `requiredAuth`
(e.g. Groww's instrument CSV search needs no token).

## api_key (per-user key)

Used by: Cloudflare.

```typescript
auth: {
  type: 'api_key',
  tokenField: 'cloudflareApiKey',
  provider: {
    in: 'header',          // 'header' | 'query'
    name: 'Authorization', // header or query param name
    prefix: 'Bearer',      // optional value prefix; omit for a bare key
    connectDescription:
      'Connect Cloudflare with an API token. Create one from My Profile > API Tokens.',
  },
},
allowedHosts: ['api.cloudflare.com'],
```

Tool code attaches the key itself via a shared helper (see `cloudflare/tools/client.ts`).
Guard a missing injected key with a connect hint instead of calling the API:

```typescript
if (!cloudflareApiKey) {
  return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
}
```

## basic_auth (username:password)

No toolkit uses this yet. `tokenField` holds a raw `'username:password'` string:

```typescript
auth: {
  type: 'basic_auth',
  tokenField: 'myServiceCredentials',
  provider: { connectDescription: '...' },
},
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

Required for OAuth and token (`bearer_token` / `api_key`) toolkits. List every hostname tools call (no user-controlled hosts). Prevents SSRF in hosted Runstack.

Skip for self-hosted service_account toolkits where base URL is user-supplied (AWS/GCP/Grafana pattern).

## Scope selection

| scope | Use when |
|-------|----------|
| `read` | GET, list, search, fetch |
| `write` | create, update, send, post, set |
| `delete` | delete, remove, cancel |

Prefer explicit scope in `tools/index.ts`. Fallback: `inferToolScope(name)` in manifest map.
