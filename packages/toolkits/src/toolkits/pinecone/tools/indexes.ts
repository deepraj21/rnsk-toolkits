// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pineconeControl, failedResult, toPineconeError } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');

export const pineconeListIndexes = tool({
  description: 'List all serverless and pod indexes with hosts, dimensions, and status.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
  }),
  execute: async ({ pineconeApiKey }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/indexes');
      if (!result.ok) return failedResult('Failed to list indexes', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing indexes');
    }
  },
});

export const pineconeDescribeIndex = tool({
  description:
    'Describe an index: host (needed for data calls), dimension, metric, spec, and status.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexName: z.string().describe('Index name'),
  }),
  execute: async ({ pineconeApiKey, indexName }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/indexes/${indexName}`);
      if (!result.ok) return failedResult('Failed to describe index', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error describing index');
    }
  },
});

export const pineconeCreateIndex = tool({
  description:
    'Create a serverless index (name, dimension, metric, cloud/region) or pod index. Use integrated-embedding spec for text indexes.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    name: z.string().describe('Index name (lowercase, alphanumeric + hyphens)'),
    dimension: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Vector dimension (omit for integrated embedding indexes)'),
    metric: z.enum(['cosine', 'euclidean', 'dotproduct']).optional().describe('Distance metric'),
    spec: z
      .record(z.string(), z.any())
      .optional()
      .describe(
        'Spec: {serverless:{cloud, region}} or {pod:{environment, pod_type, pods, replicas, shards}} or integrated-embedding spec',
      ),
    deletionProtection: z.enum(['enabled', 'disabled']).optional().describe('Deletion protection'),
  }),
  execute: async ({ pineconeApiKey, name, dimension, metric, spec, deletionProtection }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/indexes', {
        method: 'POST',
        body: {
          name,
          ...(dimension !== undefined ? { dimension } : {}),
          ...(metric !== undefined ? { metric } : {}),
          ...(spec !== undefined ? { spec } : {}),
          ...(deletionProtection !== undefined ? { deletion_protection: deletionProtection } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create index', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error creating index');
    }
  },
});

export const pineconeCreateIndexForModel = tool({
  description: 'Create an index with integrated embedding for a hosted model in one call.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    name: z.string().describe('Index name'),
    cloud: z.string().describe('Cloud, e.g. aws'),
    region: z.string().describe('Region, e.g. us-east-1'),
    embeddingModel: z.string().optional().describe('Embedding model, e.g. multilingual-e5-large'),
    metric: z.enum(['cosine', 'euclidean', 'dotproduct']).optional().describe('Distance metric'),
  }),
  execute: async ({ pineconeApiKey, name, cloud, region, embeddingModel, metric }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/indexes/create-for-model', {
        method: 'POST',
        body: {
          name,
          cloud,
          region,
          ...(embeddingModel !== undefined ? { embedding_model: embeddingModel } : {}),
          ...(metric !== undefined ? { metric } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create index for model', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error creating index for model');
    }
  },
});

export const pineconeDeleteIndex = tool({
  description: 'Delete an index and all its data. Disable deletion protection first if enabled.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexName: z.string().describe('Index name'),
  }),
  execute: async ({ pineconeApiKey, indexName }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/indexes/${indexName}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete index', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error deleting index');
    }
  },
});

export const pineconeConfigureIndex = tool({
  description: 'Scale a pod index (replicas, pod type) or update serverless settings.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexName: z.string().describe('Index name'),
    spec: z
      .record(z.string(), z.any())
      .describe('Spec update, e.g. {pod:{replicas:4}} or {pod:{pod_type:"p1.x2"}}'),
  }),
  execute: async ({ pineconeApiKey, indexName, spec }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/indexes/${indexName}`, {
        method: 'PATCH',
        body: { spec },
      });
      if (!result.ok) return failedResult('Failed to configure index', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error configuring index');
    }
  },
});

export const pineconeListCollections = tool({
  description: 'List collections (static pod-index copies for backup/archival).',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
  }),
  execute: async ({ pineconeApiKey }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/collections');
      if (!result.ok) return failedResult('Failed to list collections', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing collections');
    }
  },
});

export const pineconeDescribeCollection = tool({
  description: 'Get one collection with size, status, and source index.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    collectionName: z.string().describe('Collection name'),
  }),
  execute: async ({ pineconeApiKey, collectionName }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/collections/${collectionName}`);
      if (!result.ok) return failedResult('Failed to describe collection', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error describing collection');
    }
  },
});

export const pineconeCreateCollection = tool({
  description: 'Create a collection from a pod source index (point-in-time copy).',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    name: z.string().describe('Collection name'),
    source: z.string().describe('Source pod index name'),
  }),
  execute: async ({ pineconeApiKey, name, source }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/collections', {
        method: 'POST',
        body: { name, source },
      });
      if (!result.ok) return failedResult('Failed to create collection', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error creating collection');
    }
  },
});

export const pineconeDeleteCollection = tool({
  description: 'Delete a collection (source index is kept).',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    collectionName: z.string().describe('Collection name'),
  }),
  execute: async ({ pineconeApiKey, collectionName }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/collections/${collectionName}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete collection', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error deleting collection');
    }
  },
});

export const pineconeListIndexBackups = tool({
  description: 'List backups of an index.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexName: z.string().describe('Index name'),
  }),
  execute: async ({ pineconeApiKey, indexName }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/indexes/${indexName}/backups`);
      if (!result.ok) return failedResult('Failed to list index backups', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing index backups');
    }
  },
});

export const pineconeCreateBackup = tool({
  description: 'Create a backup of an index with optional name and description.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    indexName: z.string().describe('Index name'),
    name: z.string().optional().describe('Backup name'),
    description: z.string().optional().describe('Backup description'),
  }),
  execute: async ({ pineconeApiKey, indexName, name, description }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/indexes/${indexName}/backups`, {
        method: 'POST',
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create backup', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error creating backup');
    }
  },
});

export const pineconeListBackups = tool({
  description: 'List all project backups.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
  }),
  execute: async ({ pineconeApiKey }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/backups');
      if (!result.ok) return failedResult('Failed to list backups', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing backups');
    }
  },
});

export const pineconeDescribeBackup = tool({
  description: 'Get one backup with size, status, and source.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    backupId: z.string().describe('Backup ID'),
  }),
  execute: async ({ pineconeApiKey, backupId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/backups/${backupId}`);
      if (!result.ok) return failedResult('Failed to describe backup', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error describing backup');
    }
  },
});

export const pineconeDeleteBackup = tool({
  description: 'Delete a backup.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    backupId: z.string().describe('Backup ID'),
  }),
  execute: async ({ pineconeApiKey, backupId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/backups/${backupId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete backup', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error deleting backup');
    }
  },
});

export const pineconeRestoreFromBackup = tool({
  description: 'Create a new index from a backup.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    backupId: z.string().describe('Backup ID'),
    indexName: z.string().describe('New index name'),
  }),
  execute: async ({ pineconeApiKey, backupId, indexName }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/backups/${backupId}/create-index`, {
        method: 'POST',
        body: { name: indexName },
      });
      if (!result.ok) return failedResult('Failed to restore from backup', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error restoring from backup');
    }
  },
});

export const pineconeListRestoreJobs = tool({
  description: 'List index restore jobs with statuses.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
  }),
  execute: async ({ pineconeApiKey }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/restore-jobs');
      if (!result.ok) return failedResult('Failed to list restore jobs', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing restore jobs');
    }
  },
});

export const pineconeDescribeRestoreJob = tool({
  description: 'Get one restore job with progress.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    jobId: z.string().describe('Restore job ID'),
  }),
  execute: async ({ pineconeApiKey, jobId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/restore-jobs/${jobId}`);
      if (!result.ok) return failedResult('Failed to describe restore job', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error describing restore job');
    }
  },
});
