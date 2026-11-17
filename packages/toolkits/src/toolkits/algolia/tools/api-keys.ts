// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { algoliaRequest, compact } from './client.js';

const ACL_VALUES = [
  'addObject',
  'analytics',
  'browse',
  'deleteObject',
  'deleteIndex',
  'editSettings',
  'inference',
  'listIndexes',
  'logs',
  'personalization',
  'recommendation',
  'search',
  'seeUnretrievableAttributes',
  'settings',
] as const;

export const algoliaListApiKeys = tool({
  description:
    'Lists all API keys of the application — ACLs, restrictions (indices, referers, query parameters), rate limits, and validity. Use it to audit what each key can do before creating or revoking one. Only visible to keys that can manage keys. Needs an admin key.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
  }),
  execute: async ({ algoliaCredentials }) => {
    const result = await algoliaRequest(algoliaCredentials, '/1/keys');
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaGetApiKey = tool({
  description:
    'Retrieves one API key by its value — its ACL, index/referer/query restrictions, rate limits, and validity window. Use it to check exactly what a key permits (e.g. before deciding whether it is safe to ship to a frontend). Needs an admin key.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    key: z.string().min(1).describe('The API key value to inspect'),
  }),
  execute: async ({ algoliaCredentials, key }) => {
    if (!key) return { error: 'key is required.' };

    const result = await algoliaRequest(algoliaCredentials, `/1/keys/${encodeURIComponent(key)}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaAddApiKey = tool({
  description:
    'Creates a new API key with a chosen ACL and restrictions. acl is required (e.g. ["search"] for a frontend search key, ["search","browse"] plus index limits); restrict it further with indexes, referers, queryParameters, rate limits (maxQueriesPerIPPerHour, maxHitsPerQuery), and a validity in seconds. The response contains the new key value — store it, it is shown only here. Needs an admin key.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    acl: z
      .array(z.enum(ACL_VALUES))
      .min(1)
      .describe('Permissions granted, e.g. ["search"] or ["search","listIndexes"]'),
    description: z.string().optional().describe('What this key is for, e.g. "Storefront search"'),
    indexes: z
      .array(z.string())
      .optional()
      .describe('Only these indices may be touched, e.g. ["products"] (wildcards allowed)'),
    referers: z
      .array(z.string())
      .optional()
      .describe('Only these referrers may use the key, e.g. ["https://shop.example.com/*"]'),
    queryParameters: z
      .string()
      .optional()
      .describe('Search parameters forced on every query, e.g. "typoTolerance=strict"'),
    validity: z
      .number()
      .int()
      .optional()
      .describe('Lifetime in seconds (omit for a key that never expires)'),
    maxQueriesPerIPPerHour: z.number().int().optional().describe('Rate limit per IP per hour'),
    maxHitsPerQuery: z.number().int().optional().describe('Max hits returned per query'),
  }),
  execute: async ({
    algoliaCredentials,
    acl,
    description,
    indexes,
    referers,
    queryParameters,
    validity,
    maxQueriesPerIPPerHour,
    maxHitsPerQuery,
  }) => {
    if (!acl || !acl.length) return { error: 'acl is required (at least one permission).' };

    const result = await algoliaRequest(algoliaCredentials, '/1/keys', {
      method: 'POST',
      body: compact({
        acl,
        description,
        indexes,
        referers,
        queryParameters,
        validity,
        maxQueriesPerIPPerHour,
        maxHitsPerQuery,
      }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaUpdateApiKey = tool({
  description:
    'Updates an existing API key — change its ACL, index/referer restrictions, description, or rate limits. Only the fields you send are changed. Common use: rotate restrictions on a frontend key without recreating it. Needs an admin key.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    key: z.string().min(1).describe('The API key value to update'),
    acl: z.array(z.enum(ACL_VALUES)).optional().describe('Replacement permission list'),
    description: z.string().optional().describe('Replacement description'),
    indexes: z.array(z.string()).optional().describe('Replacement allowed index list'),
    referers: z.array(z.string()).optional().describe('Replacement allowed referrer list'),
    queryParameters: z.string().optional().describe('Replacement forced query parameters'),
    validity: z.number().int().optional().describe('Replacement lifetime in seconds'),
    maxQueriesPerIPPerHour: z.number().int().optional().describe('Replacement hourly rate limit'),
    maxHitsPerQuery: z.number().int().optional().describe('Replacement max hits per query'),
  }),
  execute: async ({
    algoliaCredentials,
    key,
    acl,
    description,
    indexes,
    referers,
    queryParameters,
    validity,
    maxQueriesPerIPPerHour,
    maxHitsPerQuery,
  }) => {
    if (!key) return { error: 'key is required.' };
    if (
      acl === undefined &&
      description === undefined &&
      indexes === undefined &&
      referers === undefined &&
      queryParameters === undefined &&
      validity === undefined &&
      maxQueriesPerIPPerHour === undefined &&
      maxHitsPerQuery === undefined
    ) {
      return { error: 'Provide at least one field to update (acl, description, indexes, referers, queryParameters, validity, maxQueriesPerIPPerHour, maxHitsPerQuery).' };
    }

    const result = await algoliaRequest(algoliaCredentials, `/1/keys/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: compact({ acl, description, indexes, referers, queryParameters, validity, maxQueriesPerIPPerHour, maxHitsPerQuery }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaDeleteApiKey = tool({
  description:
    'Deletes an API key permanently — anything using it immediately starts failing authentication. Confirm with the user first; a deleted key can be brought back with algoliaRestoreApiKey before it expires. Needs an admin key.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    key: z.string().min(1).describe('The API key value to delete'),
  }),
  execute: async ({ algoliaCredentials, key }) => {
    if (!key) return { error: 'key is required.' };

    const result = await algoliaRequest(algoliaCredentials, `/1/keys/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaRestoreApiKey = tool({
  description:
    'Restores a recently deleted API key with its original ACL and restrictions — use this to undo an accidental algoliaDeleteApiKey instead of creating a new key. Needs an admin key.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    key: z.string().min(1).describe('The deleted API key value to restore'),
  }),
  execute: async ({ algoliaCredentials, key }) => {
    if (!key) return { error: 'key is required.' };

    const result = await algoliaRequest(algoliaCredentials, `/1/keys/${encodeURIComponent(key)}/restore`, {
      method: 'POST',
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
