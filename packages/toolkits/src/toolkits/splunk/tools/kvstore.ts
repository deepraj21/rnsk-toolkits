// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { missingCredentialsError, splunkEntries, splunkRequest } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const ownerField = z.string().optional().describe('Owner context (default "nobody")');
const appField = z.string().optional().describe('App context (default "search")');

function kvNs(owner?: string, app?: string): string {
  return `/servicesNS/${encodeURIComponent(owner ?? 'nobody')}/${encodeURIComponent(app ?? 'search')}`;
}

export const splunkListKvStoreCollections = tool({
  description: 'List KV Store collections (app lookups/state tables) with their fields. Use to discover lookup data available to searches.',
  inputSchema: z.object({
    splunkCredentials: authField,
    owner: ownerField,
    app: appField,
  }),
  execute: async ({ splunkCredentials, owner, app }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, `${kvNs(owner, app)}/storage/collections/config`);
      const collections = splunkEntries(data).map((e) => ({
        name: e.name,
        fields: (e.content as Record<string, unknown> | undefined)?.field,
      }));
      return { count: collections.length, collections };
    } catch (error) {
      return { error: 'Failed to list KV Store collections', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkQueryKvStoreCollection = tool({
  description: 'Query records in a KV Store collection with an optional Mongo-style filter. Use to read lookup/state data.',
  inputSchema: z.object({
    splunkCredentials: authField,
    collection: z.string().describe('Collection name'),
    owner: ownerField,
    app: appField,
    query: z.record(z.any()).optional().describe('Mongo-style filter, e.g. {"status": "open"} (default: all records)'),
    limit: z.number().int().min(1).max(10000).optional().describe('Max records (default 100)'),
  }),
  execute: async ({ splunkCredentials, collection, owner, app, query, limit }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = (await splunkRequest(
        splunkCredentials,
        `${kvNs(owner, app)}/storage/collections/data/${encodeURIComponent(collection)}`,
        { query: { query: query ? JSON.stringify(query) : undefined, limit: limit ?? 100 } },
      )) as unknown[];
      const records = Array.isArray(data) ? data : [data];
      return { count: records.length, records };
    } catch (error) {
      return { error: 'Failed to query KV Store collection', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
