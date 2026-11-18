// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { algoliaRequest, compact } from './client.js';

export const algoliaGetSettings = tool({
  description:
    'Retrieves the full settings of an index — searchable attributes, attributesForFaceting, ranking and customRanking, typo tolerance, pagination, and synonyms/rules attributes. Read this before changing settings so you can preserve what is already configured. Needs a key with the settings ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index whose settings to read'),
    getVersion: z.number().int().optional().describe('Settings version to return (default 1)'),
  }),
  execute: async ({ algoliaCredentials, indexName, getVersion }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/settings`,
      {
        query: { getVersion },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaSetSettings = tool({
  description:
    'Updates index settings — only the fields you send are changed, the rest stay as they are (read the current values first with algoliaGetSettings). Common fields: searchableAttributes, attributesForFaceting, attributesToSnippet, ranking, customRanking, typoTolerance, maxValuesPerFacet. forwardToReplicas applies the change to replicas too. Returns a taskID. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index to configure'),
    settings: z
      .record(z.any())
      .describe(
        'Settings to apply — e.g. {"searchableAttributes":["name","description"],"attributesForFaceting":["brand","category"],"typoTolerance":true}',
      ),
    forwardToReplicas: z
      .boolean()
      .optional()
      .describe('Apply the same settings to this index’s replicas (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, settings, forwardToReplicas }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return { error: 'settings is required (a JSON object of settings to apply).' };
    }

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/settings`,
      {
        method: 'PUT',
        query: { forwardToReplicas },
        body: compact(settings),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
