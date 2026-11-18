// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { algoliaRequest } from './client.js';

export const algoliaGetTask = tool({
  description:
    'Checks the status of an indexing task on one index — every write (save, batch, delete, clear, settings, rules, synonyms) returns a taskID, and this reports whether it is still pending or published. Poll it until published to know an index is up to date. Needs a key with the addObject ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index the task runs on'),
    taskID: z.coerce.number().int().describe('Task ID returned by the write operation'),
  }),
  execute: async ({ algoliaCredentials, indexName, taskID }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (taskID === undefined || taskID === null || Number.isNaN(taskID))
      return { error: 'taskID is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/task/${taskID}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaGetAppTask = tool({
  description:
    'Checks the status of an application-wide task — operations that span indices (algoliaBatchMultipleIndexes, index copy/move) return an app-level taskID rather than an index one. Reports pending or published. Needs a key with the editSettings ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    taskID: z.coerce.number().int().describe('Application task ID returned by the write operation'),
  }),
  execute: async ({ algoliaCredentials, taskID }) => {
    if (taskID === undefined || taskID === null || Number.isNaN(taskID))
      return { error: 'taskID is required.' };

    const result = await algoliaRequest(algoliaCredentials, `/1/task/${taskID}`);
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaGetLogs = tool({
  description:
    'Retrieves recent API log entries — every query and indexing request, newest first, with its path, status, and response time. Filter to one index or to write/query entries; use it to debug failed requests or audit API usage. Needs a key with the logs ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().optional().describe('Only entries for this index (omit for all indices)'),
    length: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Max entries to return (most recent first)'),
    offset: z.number().int().min(0).optional().describe('Entries to skip for pagination'),
    type: z
      .string()
      .optional()
      .describe('Log entry type to return, e.g. "write" or "query" (omit for all)'),
  }),
  execute: async ({ algoliaCredentials, indexName, length, offset, type }) => {
    const result = await algoliaRequest(algoliaCredentials, '/1/logs', {
      query: { indexName, length, offset, type },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
