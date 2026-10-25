// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');
const storeIdField = z
  .string()
  .describe('Vector store ID (vs_...) — get it from openaiListVectorStores');
// Vector store endpoints are documented with the assistants beta header.
const VS_HEADERS = { 'OpenAI-Beta': 'assistants=v2' };

export const openaiCreateVectorStore = tool({
  description:
    'Create an empty vector store (named collection of embedded files) for the file_search tool. Attach files afterwards with openaiAddVectorStoreFile or openaiCreateVectorStoreFileBatch.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    name: z.string().describe('Display name for the store, e.g. "Product docs"'),
    fileIds: z.array(z.string()).optional().describe('File IDs to attach immediately'),
    expiresAfter: z
      .record(z.any())
      .optional()
      .describe('Auto-expiry policy, e.g. {anchor:"last_active_at", days:7}'),
    metadata: z.record(z.any()).optional().describe('Key/value metadata stored with the store'),
  }),
  execute: async ({ openaiApiKey, name, fileIds, expiresAfter, metadata }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/vector_stores', {
        method: 'POST',
        headers: VS_HEADERS,
        body: {
          name,
          ...(fileIds ? { file_ids: fileIds } : {}),
          ...(expiresAfter ? { expires_after: expiresAfter } : {}),
          ...(metadata ? { metadata } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create vector store', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error creating vector store');
    }
  },
});

export const openaiListVectorStores = tool({
  description:
    'List vector stores with file counts and statuses, paged with the returned next cursor.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    after: z.string().optional().describe('Cursor for paging — pass the previous last value'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Stores per page (default 20, max 100)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
  }),
  execute: async ({ openaiApiKey, after, limit, order }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/vector_stores', {
        headers: VS_HEADERS,
        query: { after, limit, order },
      });
      if (!result.ok) return failedResult('Failed to list vector stores', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error listing vector stores');
    }
  },
});

export const openaiGetVectorStore = tool({
  description: 'Get one vector store: name, file/incomplete-file counts, expiry, and status.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
  }),
  execute: async ({ openaiApiKey, vectorStoreId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/vector_stores/${vectorStoreId}`, {
        headers: VS_HEADERS,
      });
      if (!result.ok) return failedResult('Failed to get vector store', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting vector store');
    }
  },
});

export const openaiUpdateVectorStore = tool({
  description: 'Rename a vector store or change its expiry policy and metadata.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
    name: z.string().optional().describe('New display name'),
    expiresAfter: z
      .record(z.any())
      .optional()
      .describe('New auto-expiry policy, e.g. {anchor:"last_active_at", days:30}'),
    metadata: z.record(z.any()).optional().describe('Replacement metadata object'),
  }),
  execute: async ({ openaiApiKey, vectorStoreId, name, expiresAfter, metadata }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/vector_stores/${vectorStoreId}`, {
        method: 'POST',
        headers: VS_HEADERS,
        body: {
          ...(name ? { name } : {}),
          ...(expiresAfter ? { expires_after: expiresAfter } : {}),
          ...(metadata ? { metadata } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update vector store', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error updating vector store');
    }
  },
});

export const openaiDeleteVectorStore = tool({
  description:
    'Delete a vector store and its contents permanently (the attached files stay in Files).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
  }),
  execute: async ({ openaiApiKey, vectorStoreId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/vector_stores/${vectorStoreId}`, {
        method: 'DELETE',
        headers: VS_HEADERS,
      });
      if (!result.ok) return failedResult('Failed to delete vector store', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error deleting vector store');
    }
  },
});

export const openaiSearchVectorStore = tool({
  description:
    'Semantic search over a vector store: return the chunks of embedded files most relevant to a query (what the file_search tool does at runtime), with optional attribute filters.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
    query: z.union([z.string(), z.array(z.string())]).describe('Search text (or multiple queries)'),
    maxNumResults: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Max results to return (default 10)'),
    filters: z
      .record(z.any())
      .optional()
      .describe('Attribute filters, e.g. {eq:{key:"section",value:"faq"}}'),
    rewriteQuery: z
      .boolean()
      .optional()
      .describe('Let the model rewrite the query for better recall'),
    rankingOptions: z
      .record(z.any())
      .optional()
      .describe('e.g. {ranker:"auto-2024-11-15", score_threshold:0.5}'),
  }),
  execute: async ({
    openaiApiKey,
    vectorStoreId,
    query,
    maxNumResults,
    filters,
    rewriteQuery,
    rankingOptions,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/vector_stores/${vectorStoreId}/search`, {
        method: 'POST',
        headers: VS_HEADERS,
        body: {
          query,
          ...(maxNumResults !== undefined ? { max_num_results: maxNumResults } : {}),
          ...(filters ? { filters } : {}),
          ...(rewriteQuery !== undefined ? { rewrite_query: rewriteQuery } : {}),
          ...(rankingOptions ? { ranking_options: rankingOptions } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to search vector store', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error searching vector store');
    }
  },
});

export const openaiAddVectorStoreFile = tool({
  description:
    'Attach an uploaded file to a vector store so it gets embedded and becomes searchable (one file at a time).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
    fileId: z.string().describe('File ID to embed and attach (file_...)'),
    attributes: z
      .record(z.any())
      .optional()
      .describe('Filterable key/value attributes to tag the file with, e.g. {section:"faq"}'),
  }),
  execute: async ({ openaiApiKey, vectorStoreId, fileId, attributes }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/vector_stores/${vectorStoreId}/files`, {
        method: 'POST',
        headers: VS_HEADERS,
        body: { file_id: fileId, ...(attributes ? { attributes } : {}) },
      });
      if (!result.ok) return failedResult('Failed to attach file', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error attaching file');
    }
  },
});

export const openaiListVectorStoreFiles = tool({
  description:
    'List the files in a vector store with their embedding statuses (in_progress, completed, failed) — use to find failed ingestions.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
    after: z.string().optional().describe('Cursor for paging — pass the previous last value'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Files per page (default 20, max 100)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    filters: z
      .record(z.any())
      .optional()
      .describe('Filter by status, e.g. {key:"status", value:["completed","in_progress"]}'),
  }),
  execute: async ({ openaiApiKey, vectorStoreId, after, limit, order, filters }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, `/vector_stores/${vectorStoreId}/files`, {
        headers: VS_HEADERS,
        query: { after, limit, order, filters },
      });
      if (!result.ok) return failedResult('Failed to list vector store files', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error listing vector store files');
    }
  },
});

export const openaiDeleteVectorStoreFile = tool({
  description:
    'Detach a file from a vector store (its vectors are removed; the file itself remains in Files).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
    fileId: z.string().describe('Attached file ID to remove (file_...)'),
  }),
  execute: async ({ openaiApiKey, vectorStoreId, fileId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(
        openaiApiKey,
        `/vector_stores/${vectorStoreId}/files/${fileId}`,
        { method: 'DELETE', headers: VS_HEADERS },
      );
      if (!result.ok) return failedResult('Failed to detach file', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error detaching file');
    }
  },
});

export const openaiCreateVectorStoreFileBatch = tool({
  description:
    'Attach many files to a vector store in one embedding batch (much cheaper than attaching files one by one). Poll with openaiGetVectorStoreFileBatch.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
    fileIds: z.array(z.string()).min(1).describe('File IDs to embed and attach'),
    attributes: z
      .record(z.any())
      .optional()
      .describe('Attributes applied to every file in the batch'),
  }),
  execute: async ({ openaiApiKey, vectorStoreId, fileIds, attributes }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(
        openaiApiKey,
        `/vector_stores/${vectorStoreId}/file_batches`,
        {
          method: 'POST',
          headers: VS_HEADERS,
          body: { file_ids: fileIds, ...(attributes ? { attributes } : {}) },
        },
      );
      if (!result.ok) return failedResult('Failed to create file batch', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error creating file batch');
    }
  },
});

export const openaiGetVectorStoreFileBatch = tool({
  description:
    'Get a file-embedding batch: overall status plus per-file counts (completed, in_progress, failed) for a vector store.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
    batchId: z.string().describe('File batch ID (vsfb_...) returned when the batch was created'),
  }),
  execute: async ({ openaiApiKey, vectorStoreId, batchId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(
        openaiApiKey,
        `/vector_stores/${vectorStoreId}/file_batches/${batchId}`,
        { headers: VS_HEADERS },
      );
      if (!result.ok) return failedResult('Failed to get file batch', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting file batch');
    }
  },
});

export const openaiCancelVectorStoreFileBatch = tool({
  description: 'Cancel an in-progress file-embedding batch on a vector store.',
  inputSchema: z.object({
    openaiApiKey: keyField,
    vectorStoreId: storeIdField,
    batchId: z.string().describe('File batch ID to cancel (vsfb_...)'),
  }),
  execute: async ({ openaiApiKey, vectorStoreId, batchId }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(
        openaiApiKey,
        `/vector_stores/${vectorStoreId}/file_batches/${batchId}/cancel`,
        { method: 'POST', headers: VS_HEADERS, body: {} },
      );
      if (!result.ok) return failedResult('Failed to cancel file batch', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error cancelling file batch');
    }
  },
});
