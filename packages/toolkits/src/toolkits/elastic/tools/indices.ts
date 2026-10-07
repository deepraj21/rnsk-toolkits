// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { elasticRequest, failedResult, toElasticError } from './client.js';

const credentialsField = z
  .string()
  .describe('Elastic credentials JSON with baseUrl plus apiKey, username+password, or bearerToken');
const indexField = z.string().describe('Index name or pattern');

export const elasticGetIndex = tool({
  description: 'Get index settings, mappings, and aliases.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}`);
      if (!result.ok) return failedResult('Failed to get index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting index');
    }
  },
});

export const elasticCreateIndex = tool({
  description:
    'Create an index with settings (shards, replicas, analysis) and mappings. Idempotent names only.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('New index name (lowercase)'),
    settings: z
      .record(z.string(), z.any())
      .optional()
      .describe('Settings: number_of_shards, number_of_replicas, analysis'),
    mappings: z
      .record(z.string(), z.any())
      .optional()
      .describe('Mappings: properties {field: {type, ...}}'),
    aliases: z.record(z.string(), z.any()).optional().describe('Aliases to create with the index'),
  }),
  execute: async ({ elasticCredentials, index, settings, mappings, aliases }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}`, {
        method: 'PUT',
        body: {
          ...(settings !== undefined ? { settings } : {}),
          ...(mappings !== undefined ? { mappings } : {}),
          ...(aliases !== undefined ? { aliases } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating index');
    }
  },
});

export const elasticDeleteIndex = tool({
  description: 'Delete indices (supports wildcards). Data is lost — verify the pattern first.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to delete index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting index');
    }
  },
});

export const elasticGetIndexStats = tool({
  description: 'Get index stats: docs, store, indexing/search rates, segments.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_stats`);
      if (!result.ok) return failedResult('Failed to get index stats', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting index stats');
    }
  },
});

export const elasticRefreshIndex = tool({
  description: 'Refresh indices so recent writes are searchable.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_refresh`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to refresh index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error refreshing index');
    }
  },
});

export const elasticFlushIndex = tool({
  description: 'Flush indices (fsync translog to Lucene).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_flush`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to flush index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error flushing index');
    }
  },
});

export const elasticForceMergeIndex = tool({
  description:
    'Force-merge segments (read-only or cleanup optimization). Expensive — use off-peak.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
    maxNumSegments: z.number().int().min(1).optional().describe('Target segment count'),
    onlyExpungeDeletes: z.boolean().optional().describe('Only merge segments with deletes'),
  }),
  execute: async ({ elasticCredentials, index, maxNumSegments, onlyExpungeDeletes }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_forcemerge`, {
        method: 'POST',
        query: { max_num_segments: maxNumSegments, only_expunge_deletes: onlyExpungeDeletes },
      });
      if (!result.ok) return failedResult('Failed to force-merge index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error force-merging index');
    }
  },
});

export const elasticOpenIndex = tool({
  description: 'Open a closed index for searching and indexing.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Closed index name'),
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_open`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to open index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error opening index');
    }
  },
});

export const elasticCloseIndex = tool({
  description: 'Close an index (frees heap; blocks reads/writes until reopened).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_close`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to close index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error closing index');
    }
  },
});

export const elasticGetMapping = tool({
  description: 'Get field mappings of indices.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_mapping`);
      if (!result.ok) return failedResult('Failed to get mapping', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting mapping');
    }
  },
});

export const elasticPutMapping = tool({
  description: 'Add new fields to an existing mapping (cannot change existing field types).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
    properties: z.record(z.string(), z.any()).describe('New properties {field: {type, ...}}'),
  }),
  execute: async ({ elasticCredentials, index, properties }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_mapping`, {
        method: 'PUT',
        body: { properties },
      });
      if (!result.ok) return failedResult('Failed to put mapping', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error putting mapping');
    }
  },
});

export const elasticGetIndexSettings = tool({
  description: 'Get live index settings (replicas, refresh interval, blocks).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_settings`);
      if (!result.ok) return failedResult('Failed to get index settings', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting index settings');
    }
  },
});

export const elasticUpdateIndexSettings = tool({
  description: 'Update dynamic index settings (replicas, refresh_interval, blocks, allocation).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: indexField,
    settings: z.record(z.string(), z.any()).describe('Settings, e.g. {number_of_replicas: 2}'),
  }),
  execute: async ({ elasticCredentials, index, settings }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_settings`, {
        method: 'PUT',
        body: { index: settings },
      });
      if (!result.ok) return failedResult('Failed to update index settings', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error updating index settings');
    }
  },
});

export const elasticGetAliases = tool({
  description: 'Get aliases, optionally filtered by alias or index pattern.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    alias: z.string().optional().describe('Alias pattern filter'),
    index: z.string().optional().describe('Index pattern filter'),
  }),
  execute: async ({ elasticCredentials, alias, index }) => {
    try {
      const path = alias ? `/_alias/${alias}` : index ? `/${index}/_alias` : '/_alias';
      const result = await elasticRequest(elasticCredentials, path);
      if (!result.ok) return failedResult('Failed to get aliases', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting aliases');
    }
  },
});

export const elasticUpdateAliases = tool({
  description: 'Atomically add/remove aliases (zero-downtime reindex swaps).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    actions: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe('Actions [{add:{index, alias, filter?}}, {remove:{index, alias}}]'),
  }),
  execute: async ({ elasticCredentials, actions }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_aliases', {
        method: 'POST',
        body: { actions },
      });
      if (!result.ok) return failedResult('Failed to update aliases', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error updating aliases');
    }
  },
});

export const elasticCloneIndex = tool({
  description: 'Clone an index (same shard count multiple) into a new index.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Source index (must be read-only/blocked)'),
    target: z.string().describe('Target index name'),
    settings: z.record(z.string(), z.any()).optional().describe('Target settings overrides'),
  }),
  execute: async ({ elasticCredentials, index, target, settings }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_clone/${target}`, {
        method: 'POST',
        body: settings !== undefined ? { settings } : {},
      });
      if (!result.ok) return failedResult('Failed to clone index', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error cloning index');
    }
  },
});

export const elasticListDataStreams = tool({
  description: 'List data streams with backing indices, generation, and status.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    pattern: z.string().optional().describe('Data stream pattern filter'),
  }),
  execute: async ({ elasticCredentials, pattern }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        pattern ? `/_data_stream/${pattern}` : '/_data_stream',
      );
      if (!result.ok) return failedResult('Failed to list data streams', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing data streams');
    }
  },
});

export const elasticCreateDataStream = tool({
  description: 'Create a data stream (needs a matching composable index template).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    name: z.string().describe('Data stream name'),
  }),
  execute: async ({ elasticCredentials, name }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_data_stream/${name}`, {
        method: 'PUT',
      });
      if (!result.ok) return failedResult('Failed to create data stream', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating data stream');
    }
  },
});

export const elasticDeleteDataStream = tool({
  description: 'Delete data streams and their backing indices.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    pattern: z.string().describe('Data stream name or pattern'),
  }),
  execute: async ({ elasticCredentials, pattern }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_data_stream/${pattern}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete data stream', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting data stream');
    }
  },
});

export const elasticListIndexTemplates = tool({
  description: 'List composable index templates.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    pattern: z.string().optional().describe('Template name pattern'),
  }),
  execute: async ({ elasticCredentials, pattern }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        pattern ? `/_index_template/${pattern}` : '/_index_template',
      );
      if (!result.ok) return failedResult('Failed to list index templates', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing index templates');
    }
  },
});

export const elasticPutIndexTemplate = tool({
  description:
    'Create or replace a composable index template (index_patterns, template, priority).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    name: z.string().describe('Template name'),
    template: z
      .record(z.string(), z.any())
      .describe(
        'Template: index_patterns [], template {settings, mappings, aliases}, priority, version',
      ),
  }),
  execute: async ({ elasticCredentials, name, template }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_index_template/${name}`, {
        method: 'PUT',
        body: template,
      });
      if (!result.ok) return failedResult('Failed to put index template', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error putting index template');
    }
  },
});

export const elasticDeleteIndexTemplate = tool({
  description: 'Delete a composable index template (existing indices are kept).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    name: z.string().describe('Template name'),
  }),
  execute: async ({ elasticCredentials, name }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_index_template/${name}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete index template', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting index template');
    }
  },
});

export const elasticListIlmPolicies = tool({
  description: 'List index lifecycle (ILM) policies.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_ilm/policy');
      if (!result.ok) return failedResult('Failed to list ILM policies', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing ILM policies');
    }
  },
});

export const elasticGetIlmPolicy = tool({
  description: 'Get one ILM policy with hot/warm/cold/delete phases.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    policyName: z.string().describe('Policy name'),
  }),
  execute: async ({ elasticCredentials, policyName }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_ilm/policy/${policyName}`);
      if (!result.ok) return failedResult('Failed to get ILM policy', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting ILM policy');
    }
  },
});

export const elasticPutIlmPolicy = tool({
  description: 'Create or update an ILM policy (phases with rollover, shrink, delete actions).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    policyName: z.string().describe('Policy name'),
    policy: z.record(z.string(), z.any()).describe('Policy: phases {hot, warm, cold, delete}'),
  }),
  execute: async ({ elasticCredentials, policyName, policy }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_ilm/policy/${policyName}`, {
        method: 'PUT',
        body: { policy },
      });
      if (!result.ok) return failedResult('Failed to put ILM policy', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error putting ILM policy');
    }
  },
});

export const elasticDeleteIlmPolicy = tool({
  description: 'Delete an ILM policy (indices keep current phase, no further transitions).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    policyName: z.string().describe('Policy name'),
  }),
  execute: async ({ elasticCredentials, policyName }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_ilm/policy/${policyName}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete ILM policy', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting ILM policy');
    }
  },
});

export const elasticExplainIlm = tool({
  description: 'Explain ILM state of an index (current phase, action, step, failures).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_ilm/explain`);
      if (!result.ok) return failedResult('Failed to explain ILM', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error explaining ILM');
    }
  },
});

export const elasticRetryIlm = tool({
  description: 'Retry a failed ILM step for an index.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().describe('Index name'),
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/${index}/_ilm/retry`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to retry ILM', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error retrying ILM');
    }
  },
});
