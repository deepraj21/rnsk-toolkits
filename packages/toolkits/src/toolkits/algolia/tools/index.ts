// @ts-nocheck
import type { ToolDefinition } from '../../../core/types.js';
import {
  algoliaSearch,
  algoliaSearchMultiple,
  algoliaBrowse,
  algoliaSearchFacetValues,
  algoliaGetRecord,
  algoliaGetRecords,
} from './search.js';
import {
  algoliaListIndices,
  algoliaSaveRecord,
  algoliaAddOrUpdateRecord,
  algoliaPartialUpdateRecord,
  algoliaDeleteRecord,
  algoliaBatchRecords,
  algoliaBatchMultipleIndexes,
  algoliaDeleteRecordsByQuery,
  algoliaClearIndex,
  algoliaDeleteIndex,
  algoliaCopyOrMoveIndex,
} from './indexes.js';
import { algoliaGetSettings, algoliaSetSettings } from './settings.js';
import {
  algoliaSearchRules,
  algoliaGetRule,
  algoliaSaveRule,
  algoliaSaveRules,
  algoliaDeleteRule,
  algoliaClearRules,
} from './rules.js';
import {
  algoliaSearchSynonyms,
  algoliaGetSynonym,
  algoliaSaveSynonym,
  algoliaSaveSynonyms,
  algoliaDeleteSynonym,
  algoliaClearSynonyms,
} from './synonyms.js';
import {
  algoliaListApiKeys,
  algoliaGetApiKey,
  algoliaAddApiKey,
  algoliaUpdateApiKey,
  algoliaDeleteApiKey,
  algoliaRestoreApiKey,
} from './api-keys.js';
import { algoliaGetTask, algoliaGetAppTask, algoliaGetLogs } from './tasks.js';

export {
  algoliaSearch,
  algoliaSearchMultiple,
  algoliaBrowse,
  algoliaSearchFacetValues,
  algoliaGetRecord,
  algoliaGetRecords,
  algoliaListIndices,
  algoliaSaveRecord,
  algoliaAddOrUpdateRecord,
  algoliaPartialUpdateRecord,
  algoliaDeleteRecord,
  algoliaBatchRecords,
  algoliaBatchMultipleIndexes,
  algoliaDeleteRecordsByQuery,
  algoliaClearIndex,
  algoliaDeleteIndex,
  algoliaCopyOrMoveIndex,
  algoliaGetSettings,
  algoliaSetSettings,
  algoliaSearchRules,
  algoliaGetRule,
  algoliaSaveRule,
  algoliaSaveRules,
  algoliaDeleteRule,
  algoliaClearRules,
  algoliaSearchSynonyms,
  algoliaGetSynonym,
  algoliaSaveSynonym,
  algoliaSaveSynonyms,
  algoliaDeleteSynonym,
  algoliaClearSynonyms,
  algoliaListApiKeys,
  algoliaGetApiKey,
  algoliaAddApiKey,
  algoliaUpdateApiKey,
  algoliaDeleteApiKey,
  algoliaRestoreApiKey,
  algoliaGetTask,
  algoliaGetAppTask,
  algoliaGetLogs,
};

export const algoliaTools: ToolDefinition[] = [
  {
    name: 'algoliaSearch',
    description:
      'Searches one index — full-text query with optional filters (Algolia filter syntax, e.g. "category:book AND price<100"), facetFilters, pagination, attribute selection, and typo tolerance. Returns ranked hits with optional highlights/snippets. Needs a key with the search ACL.',
    tool: algoliaSearch,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'index', 'query', 'find', 'lookup', 'catalog'],
  },
  {
    name: 'algoliaSearchMultiple',
    description:
      'Runs several searches across indices in one request — each request carries its own indexName plus search parameters, and results come back in order. Use it to fetch the same query from multiple indices (e.g. "products" and "orders") or run variations side by side. Needs a key with the search ACL.',
    tool: algoliaSearchMultiple,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'multi', 'queries', 'batch', 'federated'],
  },
  {
    name: 'algoliaBrowse',
    description:
      'Iterates through every record in an index without a relevance cap — pass search parameters plus the cursor from the previous call to page through the full dataset (up to 1000 hits per call). Use for exports, migrations, or scanning the whole index; use algoliaSearch for ranked query results. Needs a key with the browse ACL.',
    tool: algoliaBrowse,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'cursor', 'export', 'scan', 'iterate', 'paginate'],
  },
  {
    name: 'algoliaSearchFacetValues',
    description:
      'Searches the values of one facet attribute (e.g. find brands matching "app") with usage counts — used for autocomplete on facet lists. The facet must be declared in the index settings (attributesForFaceting). Needs a key with the search ACL.',
    tool: algoliaSearchFacetValues,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'facet', 'values', 'autocomplete', 'suggestions', 'counts'],
  },
  {
    name: 'algoliaGetRecord',
    description:
      'Retrieves a single record by its objectID from an index — use it to inspect one document exactly as it is stored (before updating it, or to verify a batch write). Needs a key with the search ACL.',
    tool: algoliaGetRecord,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'record', 'document', 'fetch', 'objectid', 'item'],
  },
  {
    name: 'algoliaGetRecords',
    description:
      'Retrieves several records in one call — each request names an indexName and objectID, optionally with attributesToRetrieve. Results come back in order (missing records return null). Cheaper than fetching records one by one. Needs a key with the search ACL.',
    tool: algoliaGetRecords,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'records', 'batch', 'documents', 'bulk', 'fetch'],
  },
  {
    name: 'algoliaListIndices',
    description:
      'Lists all indices in the application — name, record count, created/updated times, and pending task IDs. Run this first to discover index names for the other Algolia tools, and to spot indices that still have indexing tasks in flight. Needs a key with the listIndexes ACL.',
    tool: algoliaListIndices,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'indices', 'indexes', 'list', 'catalog', 'discover'],
  },
  {
    name: 'algoliaSaveRecord',
    description:
      'Adds a record to an index, or replaces the record with the same objectID — if the index does not exist it is created. The body is the record itself (any JSON object; include objectID to control the id, otherwise one is auto-generated). Indexing is async: returns a taskID to check with algoliaGetTask. Needs a key with the addObject ACL.',
    tool: algoliaSaveRecord,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'record', 'insert', 'add', 'upsert', 'document'],
  },
  {
    name: 'algoliaAddOrUpdateRecord',
    description:
      'Adds or replaces the record with a specific objectID in an index — unlike algoliaSaveRecord the objectID is part of the path, so the id never changes and no auto-generated id can be returned. Returns a taskID for algoliaGetTask. Needs a key with the addObject ACL.',
    tool: algoliaAddOrUpdateRecord,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'record', 'replace', 'overwrite', 'upsert', 'put'],
  },
  {
    name: 'algoliaPartialUpdateRecord',
    description:
      'Updates only the given attributes of an existing record, leaving the rest untouched — e.g. change price without resending the whole document. Set createIfNotExists: true to create the record when the objectID is unknown. Returns a taskID for algoliaGetTask. Needs a key with the addObject ACL.',
    tool: algoliaPartialUpdateRecord,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'record', 'patch', 'merge', 'attributes', 'edit'],
  },
  {
    name: 'algoliaDeleteRecord',
    description:
      'Deletes one record from an index by objectID. Returns a taskID (deletion is processed asynchronously). Confirm with the user first. Needs a key with the deleteObject ACL.',
    tool: algoliaDeleteRecord,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'record', 'remove', 'document', 'objectid'],
  },
  {
    name: 'algoliaBatchRecords',
    description:
      'Applies many indexing actions to one index in a single request — actions are addObject, updateObject, partialUpdateObject, partialUpdateObjectNoCreate, deleteObject, delete, or clear. Far faster than individual calls; returns one taskID for the whole batch (check with algoliaGetTask). Needs a key with the addObject ACL.',
    tool: algoliaBatchRecords,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'batch', 'bulk', 'records', 'actions', 'import'],
  },
  {
    name: 'algoliaBatchMultipleIndexes',
    description:
      'Applies indexing actions across several indices in one request — each entry names its indexName plus action and body (same actions as algoliaBatchRecords). Use when writing related records to more than one index at once; returns a single taskID. Needs a key with the addObject ACL.',
    tool: algoliaBatchMultipleIndexes,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'batch', 'bulk', 'indices', 'multi', 'sync'],
  },
  {
    name: 'algoliaDeleteRecordsByQuery',
    description:
      'Deletes every record matching a filter in one operation — e.g. remove all products with inStock:false. At least one filter is required as a safety rail; without filters this would wipe the whole index (use algoliaClearIndex for that, deliberately). Returns a taskID. Needs a key with the deleteIndex ACL.',
    tool: algoliaDeleteRecordsByQuery,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'delete', 'filter', 'bulk', 'purge', 'query'],
  },
  {
    name: 'algoliaClearIndex',
    description:
      'Removes every record from an index but keeps its settings, rules, and synonyms — the fastest way to reload data from scratch. The index itself is not deleted. Confirm with the user first. Needs a key with the deleteIndex ACL.',
    tool: algoliaClearIndex,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'clear', 'empty', 'wipe', 'reset', 'truncate'],
  },
  {
    name: 'algoliaDeleteIndex',
    description:
      'Deletes an index and all its records, settings, rules, and synonyms — permanent and irreversible (Algolia does not soft-delete indices). Confirm with the user before calling. Needs a key with the deleteIndex ACL.',
    tool: algoliaDeleteIndex,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'index', 'drop', 'remove', 'destroy', 'purge'],
  },
  {
    name: 'algoliaCopyOrMoveIndex',
    description:
      'Copies or moves an index to a new name — the standard way to promote a dev index to production ("products_dev" → "products") or rename one. scope (copy only) limits what transfers: settings, synonyms, rules; without scope only records are copied. Returns a taskID. Needs a key with the addObject ACL.',
    tool: algoliaCopyOrMoveIndex,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'copy', 'move', 'rename', 'clone', 'promote', 'replica'],
  },
  {
    name: 'algoliaGetSettings',
    description:
      'Retrieves the full settings of an index — searchable attributes, attributesForFaceting, ranking and customRanking, typo tolerance, pagination, and synonyms/rules attributes. Read this before changing settings so you can preserve what is already configured. Needs a key with the settings ACL.',
    tool: algoliaGetSettings,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'settings', 'config', 'ranking', 'schema', 'faceting'],
  },
  {
    name: 'algoliaSetSettings',
    description:
      'Updates index settings — only the fields you send are changed, the rest stay as they are (read the current values first with algoliaGetSettings). Common fields: searchableAttributes, attributesForFaceting, attributesToSnippet, ranking, customRanking, typoTolerance, maxValuesPerFacet. forwardToReplicas applies the change to replicas too. Returns a taskID. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaSetSettings,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'settings', 'configure', 'ranking', 'faceting', 'typo'],
  },
  {
    name: 'algoliaSearchRules',
    description:
      'Searches the query rules of an index — rules manipulate results at query time (pin, boost, hide, filter, or redirect based on the query). Filter by text, anchoring type, context, or enabled state. Use it to find a rule before reading, editing, or deleting it. Needs a key with the settings ACL.',
    tool: algoliaSearchRules,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'rules', 'merchandising', 'pinning', 'boost', 'query'],
  },
  {
    name: 'algoliaGetRule',
    description:
      'Retrieves one rule by its objectID — its condition (query pattern, anchoring, filters, context) and consequence (promote, hide, filter, redirect, userToken, optional facets). Read a rule before editing it so you can preserve its existing fields. Needs a key with the settings ACL.',
    tool: algoliaGetRule,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'rule', 'condition', 'consequence', 'merchandising'],
  },
  {
    name: 'algoliaSaveRule',
    description:
      'Creates or replaces one rule (upsert by objectID). A rule needs objectID plus a consequence (what to do) and either condition or conditions (when to apply — query pattern with anchoring, filters, context). Example: {"objectID":"promote-shoes","condition":{"pattern":"shoes","anchoring":"contains"},"consequence":{"promote":[{"objectID":"popular-shoes","position":1}]}}. Returns a taskID. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaSaveRule,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'rule', 'create', 'pin', 'boost', 'hide', 'redirect'],
  },
  {
    name: 'algoliaSaveRules',
    description:
      'Creates or replaces several rules in one batch (each entry needs its own objectID, condition, and consequence). Set clearExistingRules to wipe the current rules first — otherwise existing rules not in the batch are kept. Returns a taskID. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaSaveRules,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'rules', 'batch', 'bulk', 'merchandising', 'import'],
  },
  {
    name: 'algoliaDeleteRule',
    description:
      'Deletes one rule by objectID. Confirm with the user first — a rule that no longer exists returns a 404 error. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaDeleteRule,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'rule', 'remove', 'delete', 'merchandising'],
  },
  {
    name: 'algoliaClearRules',
    description:
      'Deletes every rule in an index at once (settings, synonyms, and records are untouched). Confirm with the user first — the rules cannot be recovered through the API. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaClearRules,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'rules', 'clear', 'wipe', 'reset', 'bulk'],
  },
  {
    name: 'algoliaSearchSynonyms',
    description:
      'Searches the synonyms of an index — synonyms make queries match equivalent terms (e.g. "phone" also finds "mobile"). Filter by text or synonym type (synonym, oneWay, altCorrection). Use it to find a synonym entry before reading, editing, or deleting it. Needs a key with the settings ACL.',
    tool: algoliaSearchSynonyms,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'synonyms', 'synonym', 'equivalent', 'terms', 'alias'],
  },
  {
    name: 'algoliaGetSynonym',
    description:
      'Retrieves one synonym entry by objectID — its type (synonym, oneWay, altCorrection) and the terms it links (word/input with synonyms, corrections, replacements, or placeholder). Read before editing so existing fields are preserved. Needs a key with the settings ACL.',
    tool: algoliaGetSynonym,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'synonym', 'entry', 'terms', 'alias'],
  },
  {
    name: 'algoliaSaveSynonym',
    description:
      'Creates or replaces one synonym entry (upsert by objectID). Types: synonym (two-way, {"objectID":"x","type":"synonym","word":"phone","synonyms":["mobile","cellphone"]}), oneWay ({"type":"oneWay","input":"shoes","synonyms":["sneakers"]}), altCorrection ({"type":"altCorrection","word":"iphon","corrections":["iphone"]}). Returns a taskID. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaSaveSynonym,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'synonym', 'create', 'terms', 'alias', 'misspelling'],
  },
  {
    name: 'algoliaSaveSynonyms',
    description:
      'Creates or replaces several synonym entries in one batch (each needs objectID, type, and terms). Set replaceExistingSynonyms to wipe all current synonyms first — otherwise synonyms not in the batch are kept. Returns a taskID. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaSaveSynonyms,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'synonyms', 'batch', 'bulk', 'import', 'terms'],
  },
  {
    name: 'algoliaDeleteSynonym',
    description:
      'Deletes one synonym entry by objectID. Confirm with the user first — a synonym that no longer exists returns a 404 error. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaDeleteSynonym,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'synonym', 'remove', 'delete', 'terms'],
  },
  {
    name: 'algoliaClearSynonyms',
    description:
      'Deletes every synonym in an index at once (records, settings, and rules are untouched). Confirm with the user first — synonyms cannot be recovered through the API. Needs a key with the settings (editSettings) ACL.',
    tool: algoliaClearSynonyms,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'synonyms', 'clear', 'wipe', 'reset', 'bulk'],
  },
  {
    name: 'algoliaListApiKeys',
    description:
      'Lists all API keys of the application — ACLs, restrictions (indices, referers, query parameters), rate limits, and validity. Use it to audit what each key can do before creating or revoking one. Only visible to keys that can manage keys. Needs an admin key.',
    tool: algoliaListApiKeys,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'keys', 'api', 'credentials', 'acl', 'audit'],
  },
  {
    name: 'algoliaGetApiKey',
    description:
      'Retrieves one API key by its value — its ACL, index/referer/query restrictions, rate limits, and validity window. Use it to check exactly what a key permits (e.g. before deciding whether it is safe to ship to a frontend). Needs an admin key.',
    tool: algoliaGetApiKey,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'key', 'api', 'permissions', 'acl', 'inspect'],
  },
  {
    name: 'algoliaAddApiKey',
    description:
      'Creates a new API key with a chosen ACL and restrictions. acl is required (e.g. ["search"] for a frontend search key, ["search","browse"] plus index limits); restrict it further with indexes, referers, queryParameters, rate limits (maxQueriesPerIPPerHour, maxHitsPerQuery), and a validity in seconds. The response contains the new key value — store it, it is shown only here. Needs an admin key.',
    tool: algoliaAddApiKey,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'key', 'create', 'generate', 'credentials', 'restrict'],
  },
  {
    name: 'algoliaUpdateApiKey',
    description:
      'Updates an existing API key — change its ACL, index/referer restrictions, description, or rate limits. Only the fields you send are changed. Common use: rotate restrictions on a frontend key without recreating it. Needs an admin key.',
    tool: algoliaUpdateApiKey,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'key', 'update', 'rotate', 'restrictions', 'acl'],
  },
  {
    name: 'algoliaDeleteApiKey',
    description:
      'Deletes an API key permanently — anything using it immediately starts failing authentication. Confirm with the user first; a deleted key can be brought back with algoliaRestoreApiKey before it expires. Needs an admin key.',
    tool: algoliaDeleteApiKey,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'delete' as const,
    keywords: ['algolia', 'key', 'revoke', 'remove', 'credentials'],
  },
  {
    name: 'algoliaRestoreApiKey',
    description:
      'Restores a recently deleted API key with its original ACL and restrictions — use this to undo an accidental algoliaDeleteApiKey instead of creating a new key. Needs an admin key.',
    tool: algoliaRestoreApiKey,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'write' as const,
    keywords: ['algolia', 'key', 'restore', 'undo', 'recover', 'revoke'],
  },
  {
    name: 'algoliaGetTask',
    description:
      'Checks the status of an indexing task on one index — every write (save, batch, delete, clear, settings, rules, synonyms) returns a taskID, and this reports whether it is still pending or published. Poll it until published to know an index is up to date. Needs a key with the addObject ACL.',
    tool: algoliaGetTask,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'task', 'status', 'pending', 'published', 'poll'],
  },
  {
    name: 'algoliaGetAppTask',
    description:
      'Checks the status of an application-wide task — operations that span indices (algoliaBatchMultipleIndexes, index copy/move) return an app-level taskID rather than an index one. Reports pending or published. Needs a key with the editSettings ACL.',
    tool: algoliaGetAppTask,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'task', 'status', 'pending', 'published', 'global'],
  },
  {
    name: 'algoliaGetLogs',
    description:
      'Retrieves recent API log entries — every query and indexing request, newest first, with its path, status, and response time. Filter to one index or to write/query entries; use it to debug failed requests or audit API usage. Needs a key with the logs ACL.',
    tool: algoliaGetLogs,
    requiredAuth: 'algoliaCredentials' as const,
    scope: 'read' as const,
    keywords: ['algolia', 'logs', 'debug', 'requests', 'audit', 'activity'],
  },
];
