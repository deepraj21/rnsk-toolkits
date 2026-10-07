// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { elasticRequest, toNdjson, failedResult, toElasticError } from './client.js';

const credentialsField = z
  .string()
  .describe('Elastic credentials JSON with baseUrl plus apiKey, username+password, or bearerToken');

export const elasticIndexDocument = tool({
  description: 'Index a JSON document with an explicit ID (PUT creates or replaces).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
    id: z.string().describe('Document ID'),
    document: z.record(z.string(), z.any()).describe('Document body'),
    refresh: z.enum(['true', 'false', 'wait_for']).optional().describe('Refresh policy'),
  }),
  execute: async ({ elasticCredentials, index, id, document, refresh }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_doc/${id}`, {
        method: 'PUT',
        query: { refresh },
        body: document,
      });
      if (!result.ok) return failedResult('Failed to index document', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error indexing document');
    }
  },
});

export const elasticCreateDocument = tool({
  description: 'Index a document with an auto-generated ID, or fail (409) if the ID exists.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
    document: z.record(z.string(), z.any()).describe('Document body'),
    id: z.string().optional().describe('Document ID (fails with 409 when it already exists)'),
  }),
  execute: async ({ elasticCredentials, index, document, id }) => {
    try {
      const path = id ? `/${index}/_create/${id}` : `/${index}/_doc`;
      const result = await elasticRequest(elasticCredentials, path, {
        method: 'POST',
        body: document,
      });
      if (!result.ok) return failedResult('Failed to create document', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating document');
    }
  },
});

export const elasticGetDocument = tool({
  description: 'Get a document by ID with optional source filtering.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
    id: z.string().describe('Document ID'),
    sourceIncludes: z.string().optional().describe('Comma-separated fields to include'),
    sourceExcludes: z.string().optional().describe('Comma-separated fields to exclude'),
  }),
  execute: async ({ elasticCredentials, index, id, sourceIncludes, sourceExcludes }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_doc/${id}`, {
        query: { _source_includes: sourceIncludes, _source_excludes: sourceExcludes },
      });
      if (!result.ok) return failedResult('Failed to get document', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting document');
    }
  },
});

export const elasticUpdateDocument = tool({
  description: 'Partially update a document (doc merge, script, or upsert).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
    id: z.string().describe('Document ID'),
    doc: z.record(z.string(), z.any()).optional().describe('Partial document to merge'),
    script: z.record(z.string(), z.any()).optional().describe('Painless script {source, params}'),
    upsert: z.record(z.string(), z.any()).optional().describe('Document to insert when missing'),
  }),
  execute: async ({ elasticCredentials, index, id, doc, script, upsert }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_update/${id}`, {
        method: 'POST',
        body: {
          ...(doc !== undefined ? { doc } : {}),
          ...(script !== undefined ? { script } : {}),
          ...(upsert !== undefined ? { upsert } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update document', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error updating document');
    }
  },
});

export const elasticDeleteDocument = tool({
  description: 'Delete a document by ID.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
    id: z.string().describe('Document ID'),
  }),
  execute: async ({ elasticCredentials, index, id }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_doc/${id}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete document', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting document');
    }
  },
});

export const elasticBulk = tool({
  description:
    'Bulk index/update/delete operations in one NDJSON call. Each entry: {action: index|create|update|delete, index?, id?, document?}.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Default index for entries without one'),
    operations: z
      .array(
        z.object({
          action: z.enum(['index', 'create', 'update', 'delete']).describe('Bulk action'),
          index: z.string().optional().describe('Index override for this entry'),
          id: z.string().optional().describe('Document ID'),
          document: z
            .record(z.string(), z.any())
            .optional()
            .describe('Document (index/create) or update body ({doc} or {script})'),
        }),
      )
      .min(1)
      .describe('Bulk operations'),
    refresh: z.enum(['true', 'false', 'wait_for']).optional().describe('Refresh policy'),
  }),
  execute: async ({ elasticCredentials, index, operations, refresh }) => {
    try {
      const lines: Array<Record<string, unknown>> = [];
      for (const op of operations) {
        const header: Record<string, unknown> = { [op.action]: {} };
        const meta = header[op.action] as Record<string, unknown>;
        if (op.index ?? index) meta._index = (op.index ?? index) as string;
        if (op.id) meta._id = op.id;
        lines.push(header);
        if (op.action !== 'delete' && op.document !== undefined) lines.push(op.document);
      }
      const path = index ? `/${index}/_bulk` : '/_bulk';
      const result = await elasticRequest(elasticCredentials, path, {
        method: 'POST',
        query: { refresh },
        rawBody: toNdjson(lines),
      });
      if (!result.ok) return failedResult('Failed bulk operation', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error in bulk operation');
    }
  },
});

export const elasticMultiGet = tool({
  description: 'Fetch multiple documents by index/ID pairs in one call.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Default index for docs without one'),
    docs: z
      .array(
        z.object({
          index: z.string().optional(),
          id: z.string().describe('Document ID'),
          sourceIncludes: z.string().optional(),
          sourceExcludes: z.string().optional(),
        }),
      )
      .min(1)
      .describe('Documents to fetch'),
  }),
  execute: async ({ elasticCredentials, index, docs }) => {
    try {
      const path = index ? `/${index}/_mget` : '/_mget';
      const result = await elasticRequest(elasticCredentials, path, {
        method: 'POST',
        body: {
          docs: docs.map((d) => ({
            ...((d.index ?? index) ? { _index: (d.index ?? index) as string } : {}),
            _id: d.id,
            ...(d.sourceIncludes !== undefined ? { _source_includes: d.sourceIncludes } : {}),
            ...(d.sourceExcludes !== undefined ? { _source_excludes: d.sourceExcludes } : {}),
          })),
        },
      });
      if (!result.ok) return failedResult('Failed multi-get', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error in multi-get');
    }
  },
});

export const elasticCount = tool({
  description: 'Count documents matching a query (fast, no hits returned).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Index pattern (omit for all indices)'),
    query: z.record(z.string(), z.any()).optional().describe('Query DSL, e.g. {match_all:{}}'),
  }),
  execute: async ({ elasticCredentials, index, query }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `${index ? `/${index}` : ''}/_count`,
        {
          method: 'POST',
          body: query !== undefined ? { query } : {},
        },
      );
      if (!result.ok) return failedResult('Failed to count documents', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error counting documents');
    }
  },
});

export const elasticSearch = tool({
  description:
    'Full-text and structured search with the Query DSL: match/term/bool, filters, aggs, sort, highlighting, pagination.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Index pattern (omit or * for all)'),
    query: z.record(z.string(), z.any()).optional().describe('Query DSL object'),
    aggs: z.record(z.string(), z.any()).optional().describe('Aggregations'),
    sort: z.array(z.any()).optional().describe('Sort clauses'),
    size: z.number().int().min(0).optional().describe('Hits to return'),
    from: z.number().int().min(0).optional().describe('Hits to skip'),
    sourceIncludes: z.string().optional().describe('Source fields to include'),
    trackTotalHits: z.boolean().optional().describe('Exact total hit count'),
  }),
  execute: async ({
    elasticCredentials,
    index,
    query,
    aggs,
    sort,
    size,
    from,
    sourceIncludes,
    trackTotalHits,
  }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `${index ? `/${index}` : ''}/_search`,
        {
          method: 'POST',
          body: {
            ...(query !== undefined ? { query } : {}),
            ...(aggs !== undefined ? { aggs } : {}),
            ...(sort !== undefined ? { sort } : {}),
            ...(size !== undefined ? { size } : {}),
            ...(from !== undefined ? { from } : {}),
            ...(sourceIncludes !== undefined ? { _source: sourceIncludes } : {}),
            ...(trackTotalHits !== undefined ? { track_total_hits: trackTotalHits } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to search', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error searching');
    }
  },
});

export const elasticMultiSearch = tool({
  description: 'Run multiple searches in one call. Each entry: {index?, query, size?}.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    searches: z
      .array(
        z.object({
          index: z.string().optional(),
          query: z.record(z.string(), z.any()).optional(),
          size: z.number().int().min(0).optional(),
        }),
      )
      .min(1)
      .describe('Searches to run'),
  }),
  execute: async ({ elasticCredentials, searches }) => {
    try {
      const lines: Array<Record<string, unknown>> = [];
      for (const s of searches) {
        lines.push(s.index ? { index: s.index } : {});
        const body: Record<string, unknown> = {};
        if (s.query !== undefined) body.query = s.query;
        if (s.size !== undefined) body.size = s.size;
        lines.push(body);
      }
      const result = await elasticRequest(elasticCredentials, '/_msearch', {
        method: 'POST',
        rawBody: toNdjson(lines),
      });
      if (!result.ok) return failedResult('Failed multi-search', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error in multi-search');
    }
  },
});

export const elasticScrollSearch = tool({
  description: 'Deep-paginate a search with a scroll context (large exports).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    scrollId: z.string().optional().describe('Scroll ID to continue (omit to start)'),
    scroll: z.string().optional().describe('Scroll keep-alive, e.g. 1m'),
    index: z.string().optional().describe('Index pattern (first call only)'),
    query: z.record(z.string(), z.any()).optional().describe('Query DSL (first call only)'),
    size: z.number().int().min(1).optional().describe('Hits per batch'),
  }),
  execute: async ({ elasticCredentials, scrollId, scroll, index, query, size }) => {
    try {
      if (scrollId) {
        const result = await elasticRequest(elasticCredentials, '/_search/scroll', {
          method: 'POST',
          body: { scroll_id: scrollId, ...(scroll !== undefined ? { scroll } : {}) },
        });
        if (!result.ok) return failedResult('Failed to continue scroll', result);
        return result.data;
      }
      const result = await elasticRequest(
        elasticCredentials,
        `${index ? `/${index}` : ''}/_search`,
        {
          method: 'POST',
          query: { scroll: scroll ?? '1m' },
          body: {
            ...(query !== undefined ? { query } : {}),
            ...(size !== undefined ? { size } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to start scroll search', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error in scroll search');
    }
  },
});

export const elasticClearScroll = tool({
  description: 'Release scroll contexts when done paging.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    scrollIds: z.array(z.string()).min(1).describe('Scroll IDs to clear'),
  }),
  execute: async ({ elasticCredentials, scrollIds }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_search/scroll', {
        method: 'DELETE',
        body: { scroll_id: scrollIds },
      });
      if (!result.ok) return failedResult('Failed to clear scroll', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error clearing scroll');
    }
  },
});

export const elasticDeleteByQuery = tool({
  description:
    'Delete all documents matching a query. Returns task stats; use wait_for_completion=false for a task.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index pattern'),
    query: z.record(z.string(), z.any()).describe('Query DSL selecting documents'),
  }),
  execute: async ({ elasticCredentials, index, query }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_delete_by_query`, {
        method: 'POST',
        body: { query },
      });
      if (!result.ok) return failedResult('Failed to delete by query', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting by query');
    }
  },
});

export const elasticUpdateByQuery = tool({
  description: 'Update documents matching a query with a Painless script.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index pattern'),
    query: z.record(z.string(), z.any()).describe('Query DSL selecting documents'),
    script: z.record(z.string(), z.any()).describe('Painless script {source, params}'),
  }),
  execute: async ({ elasticCredentials, index, query, script }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_update_by_query`, {
        method: 'POST',
        body: { query, script },
      });
      if (!result.ok) return failedResult('Failed to update by query', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error updating by query');
    }
  },
});

export const elasticReindex = tool({
  description: 'Copy documents between indices with optional query filter and script transform.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    sourceIndex: z.string().describe('Source index'),
    destIndex: z.string().describe('Destination index'),
    query: z.record(z.string(), z.any()).optional().describe('Query DSL filter'),
    script: z.record(z.string(), z.any()).optional().describe('Painless transform script'),
  }),
  execute: async ({ elasticCredentials, sourceIndex, destIndex, query, script }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_reindex', {
        method: 'POST',
        body: {
          source: { index: sourceIndex, ...(query !== undefined ? { query } : {}) },
          dest: { index: destIndex },
          ...(script !== undefined ? { script } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to reindex', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error reindexing');
    }
  },
});

export const elasticExplainDocument = tool({
  description: 'Explain why a document matches (or not) a query with score breakdown.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
    id: z.string().describe('Document ID'),
    query: z.record(z.string(), z.any()).describe('Query DSL to explain'),
  }),
  execute: async ({ elasticCredentials, index, id, query }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_explain/${id}`, {
        method: 'POST',
        body: { query },
      });
      if (!result.ok) return failedResult('Failed to explain document', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error explaining document');
    }
  },
});

export const elasticFieldCaps = tool({
  description: 'Get capabilities (types, searchability, aggregability) of fields across indices.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Index pattern'),
    fields: z.string().describe('Comma-separated fields, wildcards allowed'),
  }),
  execute: async ({ elasticCredentials, index, fields }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `${index ? `/${index}` : ''}/_field_caps`,
        {
          method: 'POST',
          body: { fields },
        },
      );
      if (!result.ok) return failedResult('Failed to get field caps', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting field caps');
    }
  },
});

export const elasticSqlQuery = tool({
  description: 'Run SQL against Elasticsearch and get rows (JDBC-style analytics).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    query: z.string().describe('SQL, e.g. SELECT host, COUNT(*) FROM logs GROUP BY host'),
    fetchSize: z.number().int().min(1).optional().describe('Rows per page'),
  }),
  execute: async ({ elasticCredentials, query, fetchSize }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_sql', {
        method: 'POST',
        query: { format: 'json' },
        body: { query, ...(fetchSize !== undefined ? { fetch_size: fetchSize } : {}) },
      });
      if (!result.ok) return failedResult('Failed SQL query', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error running SQL query');
    }
  },
});

export const elasticSqlTranslate = tool({
  description:
    'Translate SQL to Query DSL without executing. Use to learn or debug generated queries.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    query: z.string().describe('SQL to translate'),
  }),
  execute: async ({ elasticCredentials, query }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_sql/translate', {
        method: 'POST',
        body: { query },
      });
      if (!result.ok) return failedResult('Failed to translate SQL', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error translating SQL');
    }
  },
});

export const elasticEqlSearch = tool({
  description: 'Run an EQL sequence/match query for event timelines (security, logs).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index pattern'),
    query: z
      .string()
      .describe('EQL, e.g. sequence by host [process where name="x"] [network where ...]'),
    size: z.number().int().min(1).optional().describe('Results to return'),
  }),
  execute: async ({ elasticCredentials, index, query, size }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_eql/search`, {
        method: 'POST',
        body: { query, ...(size !== undefined ? { size } : {}) },
      });
      if (!result.ok) return failedResult('Failed EQL search', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error in EQL search');
    }
  },
});

export const elasticSubmitAsyncSearch = tool({
  description: 'Submit a long search asynchronously; poll with Get Async Search.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Index pattern'),
    query: z.record(z.string(), z.any()).optional().describe('Query DSL'),
    aggs: z.record(z.string(), z.any()).optional().describe('Aggregations'),
    waitForCompletionTimeout: z.string().optional().describe('Block duration, e.g. 5s'),
    keepAlive: z.string().optional().describe('Result retention, e.g. 5d'),
  }),
  execute: async ({
    elasticCredentials,
    index,
    query,
    aggs,
    waitForCompletionTimeout,
    keepAlive,
  }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `${index ? `/${index}` : ''}/_async_search`,
        {
          method: 'POST',
          query: { wait_for_completion_timeout: waitForCompletionTimeout, keep_alive: keepAlive },
          body: {
            ...(query !== undefined ? { query } : {}),
            ...(aggs !== undefined ? { aggs } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to submit async search', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error submitting async search');
    }
  },
});

export const elasticGetAsyncSearch = tool({
  description: 'Get async search status and partial/final results.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    searchId: z.string().describe('Async search ID'),
  }),
  execute: async ({ elasticCredentials, searchId }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_async_search/${searchId}`);
      if (!result.ok) return failedResult('Failed to get async search', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting async search');
    }
  },
});

export const elasticDeleteAsyncSearch = tool({
  description: 'Delete async search results to free resources.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    searchId: z.string().describe('Async search ID'),
  }),
  execute: async ({ elasticCredentials, searchId }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_async_search/${searchId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete async search', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting async search');
    }
  },
});

export const elasticOpenPointInTime = tool({
  description: 'Open a point-in-time reader for consistent deep pagination.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index pattern'),
    keepAlive: z.string().describe('Keep-alive, e.g. 1m'),
  }),
  execute: async ({ elasticCredentials, index, keepAlive }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_pit`, {
        method: 'POST',
        query: { keep_alive: keepAlive },
      });
      if (!result.ok) return failedResult('Failed to open point in time', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error opening point in time');
    }
  },
});

export const elasticClosePointInTime = tool({
  description: 'Close a point-in-time reader.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    pitId: z.string().describe('Point-in-time ID'),
  }),
  execute: async ({ elasticCredentials, pitId }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_pit', {
        method: 'DELETE',
        body: { id: pitId },
      });
      if (!result.ok) return failedResult('Failed to close point in time', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error closing point in time');
    }
  },
});
