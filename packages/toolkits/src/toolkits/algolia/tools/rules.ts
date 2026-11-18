// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { algoliaRequest, compact } from './client.js';

export const algoliaSearchRules = tool({
  description:
    'Searches the query rules of an index — rules manipulate results at query time (pin, boost, hide, filter, or redirect based on the query). Filter by text, anchoring type, context, or enabled state. Use it to find a rule before reading, editing, or deleting it. Needs a key with the settings ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index whose rules to search'),
    query: z
      .string()
      .optional()
      .describe('Match rules containing this text (objectID, description, patterns)'),
    page: z.number().int().min(0).optional().describe('Page number, 0-based'),
    hitsPerPage: z.number().int().min(1).max(1000).optional().describe('Rules per page'),
    anchoring: z
      .enum(['is', 'startsWith', 'endsWith', 'contains', 'regex'])
      .optional()
      .describe('Only rules anchored this way'),
    context: z.string().optional().describe('Only rules with this validation context'),
    enabled: z.boolean().optional().describe('Filter to enabled (true) or disabled (false) rules'),
  }),
  execute: async ({
    algoliaCredentials,
    indexName,
    query,
    page,
    hitsPerPage,
    anchoring,
    context,
    enabled,
  }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/rules/search`,
      {
        method: 'POST',
        body: compact({ query, page, hitsPerPage, anchoring, context, enabled }),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaGetRule = tool({
  description:
    'Retrieves one rule by its objectID — its condition (query pattern, anchoring, filters, context) and consequence (promote, hide, filter, redirect, userToken, optional facets). Read a rule before editing it so you can preserve its existing fields. Needs a key with the settings ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index containing the rule'),
    objectID: z.string().min(1).describe('Rule objectID, e.g. "sku-rule"'),
  }),
  execute: async ({ algoliaCredentials, indexName, objectID }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!objectID) return { error: 'objectID is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/rules/${encodeURIComponent(objectID)}`,
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaSaveRule = tool({
  description:
    'Creates or replaces one rule (upsert by objectID). A rule needs objectID plus a consequence (what to do) and either condition or conditions (when to apply — query pattern with anchoring, filters, context). Example: {"objectID":"promote-shoes","condition":{"pattern":"shoes","anchoring":"contains"},"consequence":{"promote":[{"objectID":"popular-shoes","position":1}]}}. Returns a taskID. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index the rule belongs to'),
    rule: z
      .record(z.any())
      .describe(
        'Rule definition — objectID, condition/conditions, consequence; optional enabled, description, tags, validity',
      ),
    forwardToReplicas: z
      .boolean()
      .optional()
      .describe('Also save the rule to this index’s replicas (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, rule, forwardToReplicas }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!rule || typeof rule !== 'object' || Array.isArray(rule))
      return { error: 'rule is required (a JSON object).' };
    if (!rule.objectID) return { error: 'rule.objectID is required.' };
    if (!rule.consequence) return { error: 'rule.consequence is required.' };
    if (!rule.condition && !rule.conditions) {
      return { error: 'rule.condition (or rule.conditions) is required.' };
    }

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/rules/${encodeURIComponent(String(rule.objectID))}`,
      {
        method: 'PUT',
        query: { forwardToReplicas },
        body: compact(rule),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaSaveRules = tool({
  description:
    'Creates or replaces several rules in one batch (each entry needs its own objectID, condition, and consequence). Set clearExistingRules to wipe the current rules first — otherwise existing rules not in the batch are kept. Returns a taskID. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index the rules belong to'),
    rules: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Rule definitions — e.g. [{"objectID":"r1","condition":{"pattern":"sale","anchoring":"contains"},"consequence":{"hide":["old-sale"]}}]',
      ),
    clearExistingRules: z
      .boolean()
      .optional()
      .describe(
        'Delete all existing rules first, so the batch becomes the complete set (default false)',
      ),
    forwardToReplicas: z
      .boolean()
      .optional()
      .describe('Also save to this index’s replicas (default false)'),
  }),
  execute: async ({
    algoliaCredentials,
    indexName,
    rules,
    clearExistingRules,
    forwardToReplicas,
  }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!rules || !rules.length) return { error: 'rules is required (at least one rule).' };
    for (const [i, r] of rules.entries()) {
      if (
        !r ||
        typeof r !== 'object' ||
        !r.objectID ||
        !r.consequence ||
        (!r.condition && !r.conditions)
      ) {
        return {
          error: `rules[${i}] must include objectID, condition/conditions, and consequence.`,
        };
      }
    }

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/rules/batch`,
      {
        method: 'POST',
        query: { clearExistingRules, forwardToReplicas },
        body: rules,
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaDeleteRule = tool({
  description:
    'Deletes one rule by objectID. Confirm with the user first — a rule that no longer exists returns a 404 error. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index containing the rule'),
    objectID: z.string().min(1).describe('Rule objectID to delete'),
    forwardToReplicas: z
      .boolean()
      .optional()
      .describe('Also delete from this index’s replicas (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, objectID, forwardToReplicas }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!objectID) return { error: 'objectID is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/rules/${encodeURIComponent(objectID)}`,
      {
        method: 'DELETE',
        query: { forwardToReplicas },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaClearRules = tool({
  description:
    'Deletes every rule in an index at once (settings, synonyms, and records are untouched). Confirm with the user first — the rules cannot be recovered through the API. Needs a key with the settings (editSettings) ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index whose rules to delete'),
    forwardToReplicas: z
      .boolean()
      .optional()
      .describe('Also clear rules on this index’s replicas (default false)'),
  }),
  execute: async ({ algoliaCredentials, indexName, forwardToReplicas }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/rules/clear`,
      {
        method: 'POST',
        query: { forwardToReplicas },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
