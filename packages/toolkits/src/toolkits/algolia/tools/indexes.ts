// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { algoliaRequest, compact } from './client.js';

export const algoliaListIndices = tool({
  description:
    'Lists all indices in the application — name, record count, created/updated times, and pending task IDs. Run this first to discover index names for the other Algolia tools, and to spot indices that still have indexing tasks in flight. Needs a key with the listIndexes ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    hitsPerPage: z.number().int().min(1).max(1000).optional().describe('Indices per page (default 100)'),
    page: z.number().int().min(0).optional().describe('Page number, 0-based (omit for an unpaginated list)'),
  }),
  execute: async ({ algoliaCredentials, hitsPerPage, page }) => {
    const result = await algoliaRequest(algoliaCredentials, '/1/indexes', {
      query: { hitsPerPage, page },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaSaveRecord = tool({
  description:
    'Adds a record to an index, or replaces the record with the same objectID — if the index does not exist it is created. The body is the record itself (any JSON object; include objectID to control the id, otherwise one is auto-generated). Indexing is async: returns a taskID to check with algoliaGetTask. Needs a key with the addObject ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Target index, e.g. "products" (created if missing)'),
    record: z
      .record(z.any())
      .describe('The record — e.g. {"objectID":"1","name":"Black T-shirt","price":29.99}'),
  }),
  execute: async ({ algoliaCredentials, indexName, record }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      return { error: 'record is required (a JSON object).' };
    }

    const result = await algoliaRequest(algoliaCredentials, `/1/indexes/${encodeURIComponent(indexName)}`, {
      method: 'POST',
      body: record,
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaAddOrUpdateRecord = tool({
  description:
    'Adds or replaces the record with a specific objectID in an index — unlike algoliaSaveRecord the objectID is part of the path, so the id never changes and no auto-generated id can be returned. Returns a taskID for algoliaGetTask. Needs a key with the addObject ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Target index'),
    objectID: z.string().min(1).describe('Record objectID to add or replace'),
    record: z.record(z.any()).describe('Full record content (objectID in the body is ignored)'),
  }),
  execute: async ({ algoliaCredentials, indexName, objectID, record }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!objectID) return { error: 'objectID is required.' };
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      return { error: 'record is required (a JSON object).' };
    }

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/${encodeURIComponent(objectID)}`,
      { method: 'PUT', body: record },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaPartialUpdateRecord = tool({
  description:
    'Updates only the given attributes of an existing record, leaving the rest untouched — e.g. change price without resending the whole document. Set createIfNotExists: true to create the record when the objectID is unknown. Returns a taskID for algoliaGetTask. Needs a key with the addObject ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index containing the record'),
    objectID: z.string().min(1).describe('Record objectID to update'),
    attributes: z
      .record(z.any())
      .describe('Attributes to merge, e.g. {"price":24.99,"inStock":false} (null clears an attribute)'),
    createIfNotExists: z
      .boolean()
      .optional()
      .describe('Create the record if the objectID does not exist (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, objectID, attributes, createIfNotExists }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!objectID) return { error: 'objectID is required.' };
    if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) {
      return { error: 'attributes is required (a JSON object of fields to merge).' };
    }

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/${encodeURIComponent(objectID)}/partial`,
      {
        method: 'POST',
        query: { createIfNotExists },
        body: attributes,
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaDeleteRecord = tool({
  description:
    'Deletes one record from an index by objectID. Returns a taskID (deletion is processed asynchronously). Confirm with the user first. Needs a key with the deleteObject ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index containing the record'),
    objectID: z.string().min(1).describe('Record objectID to delete'),
  }),
  execute: async ({ algoliaCredentials, indexName, objectID }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!objectID) return { error: 'objectID is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/${encodeURIComponent(objectID)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaBatchRecords = tool({
  description:
    'Applies many indexing actions to one index in a single request — actions are addObject, updateObject, partialUpdateObject, partialUpdateObjectNoCreate, deleteObject, delete, or clear. Far faster than individual calls; returns one taskID for the whole batch (check with algoliaGetTask). Needs a key with the addObject ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index the actions apply to'),
    requests: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Actions — e.g. [{"action":"addObject","body":{"objectID":"1","name":"A"}},{"action":"partialUpdateObject","body":{"objectID":"2","price":9.99}},{"action":"deleteObject","body":{"objectID":"3"}}]',
      ),
  }),
  execute: async ({ algoliaCredentials, indexName, requests }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!requests || !requests.length) return { error: 'requests is required (at least one action).' };
    for (const [i, r] of requests.entries()) {
      if (!r || typeof r !== 'object' || !r.action || !r.body) {
        return { error: `requests[${i}] must include action and body.` };
      }
    }

    const result = await algoliaRequest(algoliaCredentials, `/1/indexes/${encodeURIComponent(indexName)}/batch`, {
      method: 'POST',
      body: { requests },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaBatchMultipleIndexes = tool({
  description:
    'Applies indexing actions across several indices in one request — each entry names its indexName plus action and body (same actions as algoliaBatchRecords). Use when writing related records to more than one index at once; returns a single taskID. Needs a key with the addObject ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    requests: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Actions — e.g. [{"indexName":"products","action":"addObject","body":{"objectID":"1"}},{"indexName":"products_archive","action":"deleteObject","body":{"objectID":"2"}}]',
      ),
  }),
  execute: async ({ algoliaCredentials, requests }) => {
    if (!requests || !requests.length) return { error: 'requests is required (at least one action).' };
    for (const [i, r] of requests.entries()) {
      if (!r || typeof r !== 'object' || !r.indexName || !r.action || !r.body) {
        return { error: `requests[${i}] must include indexName, action, and body.` };
      }
    }

    const result = await algoliaRequest(algoliaCredentials, '/1/indexes/*/batch', {
      method: 'POST',
      body: { requests },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaDeleteRecordsByQuery = tool({
  description:
    'Deletes every record matching a filter in one operation — e.g. remove all products with inStock:false. At least one filter is required as a safety rail; without filters this would wipe the whole index (use algoliaClearIndex for that, deliberately). Returns a taskID. Needs a key with the deleteIndex ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index to delete records from'),
    filters: z.string().optional().describe('Algolia filter expression, e.g. "inStock:false"'),
    facetFilters: z.array(z.any()).optional().describe('Facet filters (string entries or OR-groups)'),
    numericFilters: z.array(z.string()).optional().describe('Numeric filters, e.g. ["price<1"]'),
    tagFilters: z.any().optional().describe('Tag filter expression (string or array)'),
  }),
  execute: async ({ algoliaCredentials, indexName, filters, facetFilters, numericFilters, tagFilters }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!filters && !(facetFilters && facetFilters.length) && !(numericFilters && numericFilters.length) && !tagFilters) {
      return { error: 'At least one filter is required (filters, facetFilters, numericFilters, or tagFilters).' };
    }

    const result = await algoliaRequest(algoliaCredentials, `/1/indexes/${encodeURIComponent(indexName)}/deleteByQuery`, {
      method: 'POST',
      body: compact({ filters, facetFilters, numericFilters, tagFilters }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaClearIndex = tool({
  description:
    'Removes every record from an index but keeps its settings, rules, and synonyms — the fastest way to reload data from scratch. The index itself is not deleted. Confirm with the user first. Needs a key with the deleteIndex ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index to empty (kept with its settings)'),
  }),
  execute: async ({ algoliaCredentials, indexName }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(algoliaCredentials, `/1/indexes/${encodeURIComponent(indexName)}/clear`, {
      method: 'POST',
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaDeleteIndex = tool({
  description:
    'Deletes an index and all its records, settings, rules, and synonyms — permanent and irreversible (Algolia does not soft-delete indices). Confirm with the user before calling. Needs a key with the deleteIndex ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index to delete permanently'),
  }),
  execute: async ({ algoliaCredentials, indexName }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(algoliaCredentials, `/1/indexes/${encodeURIComponent(indexName)}`, {
      method: 'DELETE',
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaCopyOrMoveIndex = tool({
  description:
    'Copies or moves an index to a new name — the standard way to promote a dev index to production ("products_dev" → "products") or rename one. scope (copy only) limits what transfers: settings, synonyms, rules; without scope only records are copied. Returns a taskID. Needs a key with the addObject ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Source index'),
    operation: z.enum(['copy', 'move']).describe('copy = duplicate, move = rename (source is removed)'),
    destination: z.string().min(1).describe('Target index name'),
    scope: z
      .array(z.enum(['settings', 'synonyms', 'rules']))
      .optional()
      .describe('Copy only these scopes alongside records (copy operation only)'),
  }),
  execute: async ({ algoliaCredentials, indexName, operation, destination, scope }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!operation) return { error: 'operation is required (copy or move).' };
    if (!destination) return { error: 'destination is required.' };

    const result = await algoliaRequest(algoliaCredentials, `/1/indexes/${encodeURIComponent(indexName)}/operation`, {
      method: 'POST',
      body: compact({ operation, destination, scope }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
