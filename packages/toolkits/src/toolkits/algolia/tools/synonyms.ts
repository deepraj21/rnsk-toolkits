// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { algoliaRequest, compact } from './client.js';

export const algoliaSearchSynonyms = tool({
  description:
    'Searches the synonyms of an index — synonyms make queries match equivalent terms (e.g. "phone" also finds "mobile"). Filter by text or synonym type (synonym, oneWay, altCorrection). Use it to find a synonym entry before reading, editing, or deleting it. Needs a key with the settings ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index whose synonyms to search'),
    query: z.string().optional().describe('Match synonyms containing this text'),
    page: z.number().int().min(0).optional().describe('Page number, 0-based'),
    hitsPerPage: z.number().int().min(1).max(1000).optional().describe('Synonyms per page'),
    type: z
      .enum(['synonym', 'oneWay', 'altCorrection'])
      .optional()
      .describe('Restrict to one synonym type'),
  }),
  execute: async ({ algoliaCredentials, indexName, query, page, hitsPerPage, type }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/synonyms/search`,
      {
        method: 'POST',
        body: compact({ query, page, hitsPerPage, type }),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaGetSynonym = tool({
  description:
    'Retrieves one synonym entry by objectID — its type (synonym, oneWay, altCorrection) and the terms it links (word/input with synonyms, corrections, replacements, or placeholder). Read before editing so existing fields are preserved. Needs a key with the settings ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index containing the synonym'),
    objectID: z.string().min(1).describe('Synonym objectID, e.g. "phone-synonyms"'),
  }),
  execute: async ({ algoliaCredentials, indexName, objectID }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!objectID) return { error: 'objectID is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/synonyms/${encodeURIComponent(objectID)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaSaveSynonym = tool({
  description:
    'Creates or replaces one synonym entry (upsert by objectID). Types: synonym (two-way, {"objectID":"x","type":"synonym","word":"phone","synonyms":["mobile","cellphone"]}), oneWay ({"type":"oneWay","input":"shoes","synonyms":["sneakers"]}), altCorrection ({"type":"altCorrection","word":"iphon","corrections":["iphone"]}). Returns a taskID. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index the synonym belongs to'),
    synonym: z
      .record(z.any())
      .describe('Synonym definition — objectID, type, and the terms (word/input/synonyms/corrections/replacements)'),
    forwardToReplicas: z.boolean().optional().describe('Also save to this index’s replicas (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, synonym, forwardToReplicas }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!synonym || typeof synonym !== 'object' || Array.isArray(synonym)) {
      return { error: 'synonym is required (a JSON object).' };
    }
    if (!synonym.objectID) return { error: 'synonym.objectID is required.' };
    if (!synonym.type) return { error: 'synonym.type is required (synonym, oneWay, or altCorrection).' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/synonyms/${encodeURIComponent(String(synonym.objectID))}`,
      {
        method: 'PUT',
        query: { forwardToReplicas },
        body: compact(synonym),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaSaveSynonyms = tool({
  description:
    'Creates or replaces several synonym entries in one batch (each needs objectID, type, and terms). Set replaceExistingSynonyms to wipe all current synonyms first — otherwise synonyms not in the batch are kept. Returns a taskID. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index the synonyms belong to'),
    synonyms: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Synonym definitions — e.g. [{"objectID":"s1","type":"synonym","word":"tv","synonyms":["television"]}]',
      ),
    replaceExistingSynonyms: z
      .boolean()
      .optional()
      .describe('Delete all existing synonyms first, so the batch becomes the complete set (default false)'),
    forwardToReplicas: z.boolean().optional().describe('Also save to this index’s replicas (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, synonyms, replaceExistingSynonyms, forwardToReplicas }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!synonyms || !synonyms.length) return { error: 'synonyms is required (at least one entry).' };
    for (const [i, s] of synonyms.entries()) {
      if (!s || typeof s !== 'object' || !s.objectID || !s.type) {
        return { error: `synonyms[${i}] must include objectID and type.` };
      }
    }

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/synonyms/batch`,
      {
        method: 'POST',
        query: { replaceExistingSynonyms, forwardToReplicas },
        body: synonyms,
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaDeleteSynonym = tool({
  description:
    'Deletes one synonym entry by objectID. Confirm with the user first — a synonym that no longer exists returns a 404 error. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index containing the synonym'),
    objectID: z.string().min(1).describe('Synonym objectID to delete'),
    forwardToReplicas: z.boolean().optional().describe('Also delete from this index’s replicas (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, objectID, forwardToReplicas }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!objectID) return { error: 'objectID is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/synonyms/${encodeURIComponent(objectID)}`,
      {
        method: 'DELETE',
        query: { forwardToReplicas },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaClearSynonyms = tool({
  description:
    'Deletes every synonym in an index at once (records, settings, and rules are untouched). Confirm with the user first — synonyms cannot be recovered through the API. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index whose synonyms to delete'),
    forwardToReplicas: z.boolean().optional().describe('Also clear synonyms on this index’s replicas (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, forwardToReplicas }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/synonyms/clear`,
      {
        method: 'POST',
        query: { forwardToReplicas },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
