# Templates

## icon.ts

```typescript
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>`;

export const MY_SERVICE_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
```

## tools/utils.ts (HTTP helper)

```typescript
// @ts-nocheck

export async function apiRequest(token: string, url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { ok: false as const, error, status: response.status };
  }

  const data = await response.json().catch(() => null);
  return { ok: true as const, data, status: response.status };
}
```

## GET tool (minimal)

```typescript
// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const getResource = tool({
  description: 'Get a resource by ID.',
  inputSchema: z.object({
    myServiceToken: z.string().describe('The My Service access token'),
    resourceId: z.string().describe('Resource ID'),
  }),
  execute: async ({ myServiceToken, resourceId }) => {
    try {
      const response = await fetch(`https://api.example.com/v1/resources/${resourceId}`, {
        headers: { Authorization: `Bearer ${myServiceToken}` },
      });
      if (!response.ok) {
        return { error: 'Failed to get resource', details: await response.json().catch(() => ({})) };
      }
      return await response.json();
    } catch (error) {
      return { error: 'Error getting resource', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
```

## Add tool to existing toolkit

1. Create `tools/new-action.ts`
2. Import + export in `tools/index.ts`
3. Append to `<toolkit>Tools` array with name, description, requiredAuth, scope
4. Run validate — manifest auto-picks up via existing `tools.map(defineTool(...))`

No manifest.ts change unless auth/scopes/allowedHosts change.
