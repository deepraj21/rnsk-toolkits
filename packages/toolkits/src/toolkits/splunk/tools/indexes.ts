// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { missingCredentialsError, splunkEntries, splunkRequest } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');

function summarizeIndex(entry: { name?: string; content?: Record<string, unknown> }) {
  const c = entry.content ?? {};
  return {
    name: entry.name,
    disabled: c.disabled,
    totalEventCount: c.totalEventCount,
    currentDBSizeMB: c.currentDBSizeMB,
    maxTotalDataSizeMB: c.maxTotalDataSizeMB,
    homePath: c.homePath,
  };
}

export const splunkListIndexes = tool({
  description: 'List indexes with event counts, sizes and disabled state. Use to discover searchable data and storage usage.',
  inputSchema: z.object({
    splunkCredentials: authField,
    count: z.number().int().min(1).max(1000).optional().describe('Max indexes to return (default 100)'),
  }),
  execute: async ({ splunkCredentials, count }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      const data = await splunkRequest(splunkCredentials, '/services/data/indexes', {
        query: { count: count ?? 100 },
      });
      const indexes = splunkEntries(data).map(summarizeIndex);
      return { count: indexes.length, indexes };
    } catch (error) {
      return { error: 'Failed to list indexes', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkGetIndex = tool({
  description: 'Get index details including paths, retention, frozen/cold behavior and size limits.',
  inputSchema: z.object({
    splunkCredentials: authField,
    indexName: z.string().describe('Index name'),
  }),
  execute: async ({ splunkCredentials, indexName }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, `/services/data/indexes/${encodeURIComponent(indexName)}`);
    } catch (error) {
      return { error: 'Failed to get index', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkCreateIndex = tool({
  description: 'Create a new event index with optional storage paths and size cap. Use before onboarding a new data source.',
  inputSchema: z.object({
    splunkCredentials: authField,
    indexName: z.string().describe('Index name (lowercase, no spaces)'),
    homePath: z.string().optional().describe('Hot/warm bucket path, e.g. "$SPLUNK_DB/myindex/db"'),
    coldPath: z.string().optional().describe('Cold bucket path'),
    thawedPath: z.string().optional().describe('Thawed bucket path'),
    maxTotalDataSizeMB: z.number().int().min(1).optional().describe('Max index size in MB before rolling to frozen'),
  }),
  execute: async ({ splunkCredentials, indexName, homePath, coldPath, thawedPath, maxTotalDataSizeMB }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, '/services/data/indexes', {
        method: 'POST',
        form: {
          name: indexName,
          homePath,
          coldPath,
          thawedPath,
          maxTotalDataSizeMB,
        },
      });
    } catch (error) {
      return { error: 'Failed to create index', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const splunkDeleteIndex = tool({
  description: 'Delete an index and all its data. Irreversible — confirm with the user first.',
  inputSchema: z.object({
    splunkCredentials: authField,
    indexName: z.string().describe('Index name to delete'),
  }),
  execute: async ({ splunkCredentials, indexName }) => {
    if (!splunkCredentials) return missingCredentialsError();
    try {
      return await splunkRequest(splunkCredentials, `/services/data/indexes/${encodeURIComponent(indexName)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return { error: 'Failed to delete index', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
