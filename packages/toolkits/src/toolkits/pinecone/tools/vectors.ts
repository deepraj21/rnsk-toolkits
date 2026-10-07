// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pineconeIndex, failedResult, toPineconeError } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');
const hostField = z
  .string()
  .describe('Index host from Describe Index, e.g. my-index-abc123.svc.region.pinecone.io');
const namespaceField = z.string().optional().describe('Namespace (default namespace when omitted)');

const vectorField = z
  .object({
    id: z.string().describe('Vector ID'),
    values: z.array(z.number()).optional().describe('Dense values (omit for integrated indexes)'),
    sparseValues: z
      .object({ indices: z.array(z.number().int()), values: z.array(z.number()) })
      .optional()
      .describe('Sparse values'),
    metadata: z.record(z.string(), z.any()).optional().describe('Metadata for filtering'),
  })
  .describe('Vector record');

export const pineconeDescribeIndexStats = tool({
  description:
    'Get vector counts per namespace and index fullness. Use to check size before querying.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    filter: z.record(z.string(), z.any()).optional().describe('Metadata filter to scope counts'),
  }),
  execute: async ({ pineconeApiKey, indexHost, filter }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/describe_index_stats', {
        method: 'POST',
        body: filter !== undefined ? { filter } : {},
      });
      if (!result.ok) return failedResult('Failed to describe index stats', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error describing index stats');
    }
  },
});

export const pineconeUpsertVectors = tool({
  description:
    'Upsert up to 1000 vectors (id, values, sparse values, metadata) into a namespace. Overwrites existing IDs. For 10M+ records prefer bulk import.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    vectors: z.array(vectorField).min(1).max(1000).describe('Vectors to upsert'),
    namespace: namespaceField,
  }),
  execute: async ({ pineconeApiKey, indexHost, vectors, namespace }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/vectors/upsert', {
        method: 'POST',
        body: {
          vectors,
          ...(namespace !== undefined ? { namespace } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to upsert vectors', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error upserting vectors');
    }
  },
});

export const pineconeUpdateVector = tool({
  description: 'Update values and/or metadata of one vector by ID.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    id: z.string().describe('Vector ID'),
    values: z.array(z.number()).optional().describe('New dense values'),
    metadata: z.record(z.string(), z.any()).optional().describe('Metadata patch (setMetadata)'),
    namespace: namespaceField,
  }),
  execute: async ({ pineconeApiKey, indexHost, id, values, metadata, namespace }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/vectors/update', {
        method: 'POST',
        body: {
          id,
          ...(values !== undefined ? { values } : {}),
          ...(metadata !== undefined ? { setMetadata: metadata } : {}),
          ...(namespace !== undefined ? { namespace } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update vector', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error updating vector');
    }
  },
});

export const pineconeFetchVectors = tool({
  description: 'Fetch vectors by ID with values and/or metadata.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    ids: z.array(z.string()).min(1).describe('Vector IDs'),
    namespace: namespaceField,
  }),
  execute: async ({ pineconeApiKey, indexHost, ids, namespace }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/vectors/fetch', {
        query: { ids, namespace },
      });
      if (!result.ok) return failedResult('Failed to fetch vectors', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error fetching vectors');
    }
  },
});

export const pineconeFetchByMetadata = tool({
  description: 'Fetch vectors by metadata filter with pagination.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    filter: z.record(z.string(), z.any()).describe('Metadata filter, e.g. {genre:{$eq:"drama"}}'),
    namespace: namespaceField,
    limit: z.number().int().min(1).optional().describe('Max vectors to return'),
    paginationToken: z.string().optional().describe('Token to continue listing'),
  }),
  execute: async ({ pineconeApiKey, indexHost, filter, namespace, limit, paginationToken }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/vectors/fetch_by_metadata', {
        method: 'POST',
        body: {
          filter,
          ...(namespace !== undefined ? { namespace } : {}),
          ...(limit !== undefined ? { limit } : {}),
          ...(paginationToken !== undefined ? { paginationToken } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to fetch by metadata', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error fetching by metadata');
    }
  },
});

export const pineconeDeleteVectors = tool({
  description:
    'Delete vectors by IDs, by metadata filter, or wipe a namespace with deleteAll. Filter and IDs are mutually exclusive.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    ids: z.array(z.string()).optional().describe('Vector IDs to delete'),
    filter: z.record(z.string(), z.any()).optional().describe('Metadata filter to select vectors'),
    deleteAll: z.boolean().optional().describe('Delete all vectors in the namespace'),
    namespace: namespaceField,
  }),
  execute: async ({ pineconeApiKey, indexHost, ids, filter, deleteAll, namespace }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/vectors/delete', {
        method: 'POST',
        body: {
          ...(ids !== undefined ? { ids } : {}),
          ...(filter !== undefined ? { filter } : {}),
          ...(deleteAll === true ? { deleteAll: true } : {}),
          ...(namespace !== undefined ? { namespace } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to delete vectors', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error deleting vectors');
    }
  },
});

export const pineconeListVectorIds = tool({
  description: 'List vector IDs in a namespace with pagination (metadata-filterable).',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    namespace: namespaceField,
    limit: z.number().int().min(1).optional().describe('IDs per page'),
    paginationToken: z.string().optional().describe('Token to continue listing'),
    filter: z.record(z.string(), z.any()).optional().describe('Metadata filter'),
  }),
  execute: async ({ pineconeApiKey, indexHost, namespace, limit, paginationToken, filter }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/vectors/list', {
        query: {
          namespace,
          limit,
          paginationToken,
          ...(filter !== undefined ? { filter: JSON.stringify(filter) } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to list vector IDs', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing vector IDs');
    }
  },
});

export const pineconeQueryVectors = tool({
  description:
    'Semantic search by vector (or vector ID) with metadata filters, topK, and score/include options. Core retrieval operation.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    vector: z.array(z.number()).optional().describe('Query vector (same dimension as index)'),
    id: z.string().optional().describe('Vector ID to use as the query (instead of vector)'),
    topK: z.number().int().min(1).max(10000).describe('Results to return'),
    namespace: namespaceField,
    filter: z.record(z.string(), z.any()).optional().describe('Metadata filter'),
    includeValues: z.boolean().optional().describe('Return vector values'),
    includeMetadata: z.boolean().optional().describe('Return metadata'),
    sparseVector: z
      .object({ indices: z.array(z.number().int()), values: z.array(z.number()) })
      .optional()
      .describe('Hybrid sparse query component'),
  }),
  execute: async ({
    pineconeApiKey,
    indexHost,
    vector,
    id,
    topK,
    namespace,
    filter,
    includeValues,
    includeMetadata,
    sparseVector,
  }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/query', {
        method: 'POST',
        body: {
          ...(vector !== undefined ? { vector } : {}),
          ...(id !== undefined ? { id } : {}),
          topK,
          ...(namespace !== undefined ? { namespace } : {}),
          ...(filter !== undefined ? { filter } : {}),
          ...(includeValues !== undefined ? { includeValues } : {}),
          ...(includeMetadata !== undefined ? { includeMetadata } : {}),
          ...(sparseVector !== undefined ? { sparseVector } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to query vectors', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error querying vectors');
    }
  },
});

export const pineconeUpsertRecords = tool({
  description:
    'Upsert text records into an integrated-embedding index; Pinecone embeds server-side. Records carry _id plus text/metadata fields.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    namespace: z.string().describe('Namespace'),
    records: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Records [{_id, chunk_text/text, ...metadata}]'),
  }),
  execute: async ({ pineconeApiKey, indexHost, namespace, records }) => {
    try {
      const result = await pineconeIndex(
        pineconeApiKey,
        indexHost,
        `/records/namespaces/${namespace}/upsert`,
        {
          method: 'POST',
          body: { records },
        },
      );
      if (!result.ok) return failedResult('Failed to upsert records', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error upserting records');
    }
  },
});

export const pineconeSearchRecords = tool({
  description:
    'Text search on an integrated-embedding index with reranking support. Returns fields plus scores.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    namespace: z.string().describe('Namespace'),
    topK: z.number().int().min(1).describe('Records to return'),
    inputs: z.record(z.string(), z.any()).optional().describe('Text inputs, e.g. {text: "query"}'),
    vector: z.record(z.string(), z.any()).optional().describe('Raw vector query alternative'),
    filter: z.record(z.string(), z.any()).optional().describe('Metadata filter'),
    fields: z.array(z.string()).optional().describe('Fields to return, e.g. ["chunk_text"]'),
    rerank: z.record(z.string(), z.any()).optional().describe('Rerank {model, top_n, rank_fields}'),
  }),
  execute: async ({
    pineconeApiKey,
    indexHost,
    namespace,
    topK,
    inputs,
    vector,
    filter,
    fields,
    rerank,
  }) => {
    try {
      const result = await pineconeIndex(
        pineconeApiKey,
        indexHost,
        `/records/namespaces/${namespace}/search`,
        {
          method: 'POST',
          body: {
            query: {
              top_k: topK,
              ...(inputs !== undefined ? { inputs } : {}),
              ...(vector !== undefined ? { vector } : {}),
              ...(filter !== undefined ? { filter } : {}),
            },
            ...(fields !== undefined ? { fields } : {}),
            ...(rerank !== undefined ? { rerank } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to search records', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error searching records');
    }
  },
});

export const pineconeListNamespaces = tool({
  description: 'List namespaces in the index.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
  }),
  execute: async ({ pineconeApiKey, indexHost }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/namespaces');
      if (!result.ok) return failedResult('Failed to list namespaces', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing namespaces');
    }
  },
});

export const pineconeCreateNamespace = tool({
  description: 'Create a namespace with an optional metadata filterability schema.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    name: z.string().describe('Namespace name'),
    schema: z
      .record(z.string(), z.any())
      .optional()
      .describe('Metadata schema {fields: {genre: {filterable: true}}}'),
  }),
  execute: async ({ pineconeApiKey, indexHost, name, schema }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/namespaces', {
        method: 'POST',
        body: { name, ...(schema !== undefined ? { schema } : {}) },
      });
      if (!result.ok) return failedResult('Failed to create namespace', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error creating namespace');
    }
  },
});

export const pineconeDescribeNamespace = tool({
  description: 'Describe a namespace with record counts and schema.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    namespace: z.string().describe('Namespace name'),
  }),
  execute: async ({ pineconeApiKey, indexHost, namespace }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, `/namespaces/${namespace}`);
      if (!result.ok) return failedResult('Failed to describe namespace', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error describing namespace');
    }
  },
});

export const pineconeListImports = tool({
  description: 'List bulk import jobs (S3/object-storage ingestion) with statuses.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
  }),
  execute: async ({ pineconeApiKey, indexHost }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/bulk/imports');
      if (!result.ok) return failedResult('Failed to list imports', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing imports');
    }
  },
});

export const pineconeStartImport = tool({
  description: 'Start a bulk import of Parquet data from object storage (for 10M+ records).',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    uri: z.string().describe('Bucket/directory URI with the import data'),
    integrationId: z.string().optional().describe('Storage integration ID'),
    errorMode: z.enum(['abort', 'continue']).optional().describe('On-error behavior'),
  }),
  execute: async ({ pineconeApiKey, indexHost, uri, integrationId, errorMode }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, '/bulk/imports', {
        method: 'POST',
        body: {
          uri,
          ...(integrationId !== undefined ? { integrationId } : {}),
          ...(errorMode !== undefined ? { errorMode: { onError: errorMode } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to start import', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error starting import');
    }
  },
});

export const pineconeDescribeImport = tool({
  description: 'Get a bulk import job with progress and errors.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexHost: hostField,
    importId: z.string().describe('Import job ID'),
  }),
  execute: async ({ pineconeApiKey, indexHost, importId }) => {
    try {
      const result = await pineconeIndex(pineconeApiKey, indexHost, `/bulk/imports/${importId}`);
      if (!result.ok) return failedResult('Failed to describe import', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error describing import');
    }
  },
});
