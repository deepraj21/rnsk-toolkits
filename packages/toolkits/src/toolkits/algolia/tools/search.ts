// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { algoliaRequest, compact } from './client.js';

export const algoliaSearch = tool({
  description:
    'Searches one index — full-text query with optional filters (Algolia filter syntax, e.g. "category:book AND price<100"), facetFilters, pagination, attribute selection, and typo tolerance. Returns ranked hits with optional highlights/snippets. Needs a key with the search ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index to search, e.g. "products_dev"'),
    query: z.string().optional().describe('Search query text; empty string matches all records'),
    page: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Page number, 0-based (combine with hitsPerPage)'),
    hitsPerPage: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Results per page (default 20)'),
    filters: z
      .string()
      .optional()
      .describe('Algolia filter expression, e.g. "category:book AND inStock:true"'),
    facetFilters: z
      .array(z.any())
      .optional()
      .describe(
        'Facet filters — array of strings, or nested arrays for OR groups, e.g. ["brand:Apple", ["color:red","color:blue"]]',
      ),
    facets: z
      .array(z.string())
      .optional()
      .describe('Facet attributes to compute counts for, e.g. ["brand","category"]'),
    attributesToRetrieve: z
      .array(z.string())
      .optional()
      .describe('Only return these attributes, e.g. ["name","price","image"] — smaller responses'),
    attributesToHighlight: z
      .array(z.string())
      .optional()
      .describe('Wrap matches in these attributes with _highlightResult markers'),
    tagFilters: z.any().optional().describe('Tag filter expression (string or array of tags)'),
    numericFilters: z
      .array(z.string())
      .optional()
      .describe('Numeric filters, e.g. ["price<100","stock>0"]'),
    distinct: z
      .number()
      .int()
      .optional()
      .describe('Deduplicate hits by this attribute value (1 = on)'),
    typoTolerance: z
      .boolean()
      .optional()
      .describe('Allow typos (default true); set false for exact matching only'),
    responseFields: z
      .array(z.string())
      .optional()
      .describe('Limit response to these fields, e.g. ["hits","nbHits","processingTimeMS"]'),
    userToken: z
      .string()
      .optional()
      .describe('End-user identifier for analytics/personalization attribution'),
    clickAnalytics: z
      .boolean()
      .optional()
      .describe('Track clicks for analytics (requires userToken for stable reporting)'),
    extra: z
      .record(z.any())
      .optional()
      .describe(
        'Any additional Algolia search parameters merged into the body (advancedSyntax, ranking, aroundLatLng, ...)',
      ),
  }),
  execute: async ({
    algoliaCredentials,
    indexName,
    query,
    page,
    hitsPerPage,
    filters,
    facetFilters,
    facets,
    attributesToRetrieve,
    attributesToHighlight,
    tagFilters,
    numericFilters,
    distinct,
    typoTolerance,
    responseFields,
    userToken,
    clickAnalytics,
    extra,
  }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/query`,
      {
        method: 'POST',
        body: compact({
          query,
          page,
          hitsPerPage,
          filters,
          facetFilters,
          facets,
          attributesToRetrieve,
          attributesToHighlight,
          tagFilters,
          numericFilters,
          distinct,
          typoTolerance,
          responseFields,
          userToken,
          clickAnalytics,
          ...(extra || {}),
        }),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaSearchMultiple = tool({
  description:
    'Runs several searches across indices in one request — each request carries its own indexName plus search parameters, and results come back in order. Use it to fetch the same query from multiple indices (e.g. "products" and "orders") or run variations side by side. Needs a key with the search ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    requests: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Search requests — e.g. [{"indexName":"products","query":"shirt","hitsPerPage":5},{"indexName":"orders","query":"shirt"}]',
      ),
    strategy: z
      .enum(['none', 'stopIfEnoughMatches'])
      .optional()
      .describe(
        'none (default) runs every request; stopIfEnoughMatches stops once enough results exist',
      ),
  }),
  execute: async ({ algoliaCredentials, requests, strategy }) => {
    if (!requests || !requests.length)
      return { error: 'requests is required (at least one search request).' };
    for (const [i, r] of requests.entries()) {
      if (!r || typeof r !== 'object' || !r.indexName) {
        return { error: `requests[${i}] must include indexName.` };
      }
    }

    const result = await algoliaRequest(algoliaCredentials, '/1/indexes/*/queries', {
      method: 'POST',
      body: compact({ requests, strategy }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaBrowse = tool({
  description:
    'Iterates through every record in an index without a relevance cap — pass search parameters plus the cursor from the previous call to page through the full dataset (up to 1000 hits per call). Use for exports, migrations, or scanning the whole index; use algoliaSearch for ranked query results. Needs a key with the browse ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index to browse'),
    query: z
      .string()
      .optional()
      .describe('Optional query to narrow the browse (empty matches all)'),
    hitsPerPage: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Records per call (default 1000 max)'),
    filters: z.string().optional().describe('Algolia filter expression to restrict the browse'),
    facetFilters: z
      .array(z.any())
      .optional()
      .describe('Facet filters (string entries or OR-groups)'),
    attributesToRetrieve: z.array(z.string()).optional().describe('Only return these attributes'),
    cursor: z
      .string()
      .optional()
      .describe('Cursor returned by the previous browse call — omit on the first call'),
    extra: z
      .record(z.any())
      .optional()
      .describe('Additional browse/search parameters merged into the body'),
  }),
  execute: async ({
    algoliaCredentials,
    indexName,
    query,
    hitsPerPage,
    filters,
    facetFilters,
    attributesToRetrieve,
    cursor,
    extra,
  }) => {
    if (!indexName) return { error: 'indexName is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/browse`,
      {
        method: 'POST',
        body: compact({
          query,
          hitsPerPage,
          filters,
          facetFilters,
          attributesToRetrieve,
          cursor,
          ...(extra || {}),
        }),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaSearchFacetValues = tool({
  description:
    'Searches the values of one facet attribute (e.g. find brands matching "app") with usage counts — used for autocomplete on facet lists. The facet must be declared in the index settings (attributesForFaceting). Needs a key with the search ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index to query'),
    facetName: z.string().min(1).describe('Facet attribute to search values of, e.g. "brand"'),
    facetQuery: z.string().optional().describe('Text to match against facet values, e.g. "app"'),
    maxFacetHits: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Max values returned (default 10)'),
    params: z
      .string()
      .optional()
      .describe(
        'Raw search parameter string to scope the facet search, e.g. "filters=inStock:true"',
      ),
  }),
  execute: async ({
    algoliaCredentials,
    indexName,
    facetName,
    facetQuery,
    maxFacetHits,
    params,
  }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!facetName) return { error: 'facetName is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/facets/${encodeURIComponent(facetName)}/query`,
      {
        method: 'POST',
        body: compact({ facetQuery, maxFacetHits, params }),
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaGetRecord = tool({
  description:
    'Retrieves a single record by its objectID from an index — use it to inspect one document exactly as it is stored (before updating it, or to verify a batch write). Needs a key with the search ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    indexName: z.string().min(1).describe('Index containing the record'),
    objectID: z.string().min(1).describe('Record objectID, e.g. "blackTShirt"'),
    attributesToRetrieve: z.array(z.string()).optional().describe('Only return these attributes'),
  }),
  execute: async ({ algoliaCredentials, indexName, objectID, attributesToRetrieve }) => {
    if (!indexName) return { error: 'indexName is required.' };
    if (!objectID) return { error: 'objectID is required.' };

    const result = await algoliaRequest(
      algoliaCredentials,
      `/1/indexes/${encodeURIComponent(indexName)}/${encodeURIComponent(objectID)}`,
      { query: { attributesToRetrieve } },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const algoliaGetRecords = tool({
  description:
    'Retrieves several records in one call — each request names an indexName and objectID, optionally with attributesToRetrieve. Results come back in order (missing records return null). Cheaper than fetching records one by one. Needs a key with the search ACL.',
  inputSchema: z.object({
    algoliaCredentials: z
      .string()
      .optional()
      .describe('Algolia credentials JSON with applicationId and apiKey (injected by system)'),
    requests: z
      .array(z.record(z.any()))
      .min(1)
      .describe(
        'Record lookups — e.g. [{"indexName":"products","objectID":"1"},{"indexName":"products","objectID":"2","attributesToRetrieve":["name","price"]}]',
      ),
  }),
  execute: async ({ algoliaCredentials, requests }) => {
    if (!requests || !requests.length)
      return { error: 'requests is required (at least one record lookup).' };
    for (const [i, r] of requests.entries()) {
      if (!r || typeof r !== 'object' || !r.indexName || !r.objectID) {
        return { error: `requests[${i}] must include indexName and objectID.` };
      }
    }

    const result = await algoliaRequest(algoliaCredentials, '/1/indexes/*/objects', {
      method: 'POST',
      body: { requests },
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
