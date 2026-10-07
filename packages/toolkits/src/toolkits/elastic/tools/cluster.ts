// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { elasticRequest, failedResult, toElasticError } from './client.js';

const credentialsField = z
  .string()
  .describe('Elastic credentials JSON with baseUrl plus apiKey, username+password, or bearerToken');

export const elasticGetInfo = tool({
  description: 'Get cluster info: name, version, build, and tagline. Use to verify connectivity.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/');
      if (!result.ok) return failedResult('Failed to get cluster info', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting cluster info');
    }
  },
});

export const elasticGetHealth = tool({
  description: 'Get cluster health (green/yellow/red), optionally scoped to an index.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Index pattern to scope health to'),
    level: z.enum(['cluster', 'indices', 'shards']).optional().describe('Detail level'),
  }),
  execute: async ({ elasticCredentials, index, level }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        index ? `/_cluster/health/${index}` : '/_cluster/health',
        { query: { level } },
      );
      if (!result.ok) return failedResult('Failed to get cluster health', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting cluster health');
    }
  },
});

export const elasticGetHealthReport = tool({
  description: 'Get the health report with per-feature indicators and diagnoses.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    verbose: z.boolean().optional().describe('Full details for every indicator'),
  }),
  execute: async ({ elasticCredentials, verbose }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_health_report', {
        query: { verbose },
      });
      if (!result.ok) return failedResult('Failed to get health report', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting health report');
    }
  },
});

export const elasticGetStats = tool({
  description: 'Get cluster-wide stats: nodes, indices, shards, memory, and store.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_cluster/stats');
      if (!result.ok) return failedResult('Failed to get cluster stats', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting cluster stats');
    }
  },
});

export const elasticGetState = tool({
  description: 'Get cluster state (metadata, routing, blocks). Filter by metrics/indices for size.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    metric: z.string().optional().describe('Metrics subset, e.g. metadata,routing_table,blocks'),
    index: z.string().optional().describe('Index pattern filter'),
  }),
  execute: async ({ elasticCredentials, metric, index }) => {
    try {
      const path = metric
        ? `/_cluster/state/${metric}${index ? `/${index}` : ''}`
        : '/_cluster/state';
      const result = await elasticRequest(elasticCredentials, path);
      if (!result.ok) return failedResult('Failed to get cluster state', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting cluster state');
    }
  },
});

export const elasticGetSettings = tool({
  description: 'Get persistent and transient cluster settings.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_cluster/settings');
      if (!result.ok) return failedResult('Failed to get cluster settings', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting cluster settings');
    }
  },
});

export const elasticUpdateSettings = tool({
  description:
    'Update persistent and/or transient cluster settings (shard allocation, recovery, search defaults).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    persistent: z
      .record(z.string(), z.any())
      .optional()
      .describe('Persistent settings surviving restart'),
    transient: z
      .record(z.string(), z.any())
      .optional()
      .describe('Transient settings (reset on restart)'),
  }),
  execute: async ({ elasticCredentials, persistent, transient }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_cluster/settings', {
        method: 'PUT',
        body: {
          ...(persistent !== undefined ? { persistent } : {}),
          ...(transient !== undefined ? { transient } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update cluster settings', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error updating cluster settings');
    }
  },
});

export const elasticGetPendingTasks = tool({
  description:
    'List pending cluster-level tasks (queue depth, priorities). Use when updates stall.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_cluster/pending_tasks');
      if (!result.ok) return failedResult('Failed to get pending tasks', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting pending tasks');
    }
  },
});

export const elasticReroute = tool({
  description: 'Manually move/cancel/allocate replica shards (with dry-run and explain).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    commands: z
      .array(z.record(z.string(), z.any()))
      .min(1)
      .describe(
        'Reroute commands [{move:{index,shard,from_node,to_node}}, {cancel:{...}}, {allocate_replica:{...}}]',
      ),
    dryRun: z.boolean().optional().describe('Preview without executing'),
    explain: z.boolean().optional().describe('Explain decisions'),
  }),
  execute: async ({ elasticCredentials, commands, dryRun, explain }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_cluster/reroute', {
        method: 'POST',
        query: { dry_run: dryRun, explain },
        body: { commands },
      });
      if (!result.ok) return failedResult('Failed to reroute cluster', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error rerouting cluster');
    }
  },
});

export const elasticExplainAllocation = tool({
  description: 'Explain why a shard is unassigned or stuck (allocation deciders output).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Index name'),
    shard: z.number().int().min(0).optional().describe('Shard ID'),
    primary: z.boolean().optional().describe('Explain the primary shard'),
  }),
  execute: async ({ elasticCredentials, index, shard, primary }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_cluster/allocation/explain', {
        method: 'POST',
        body: {
          ...(index !== undefined ? { index } : {}),
          ...(shard !== undefined ? { shard } : {}),
          ...(primary !== undefined ? { primary } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to explain allocation', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error explaining allocation');
    }
  },
});

export const elasticGetRemoteInfo = tool({
  description: 'Get configured remote clusters for cross-cluster search/replication.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_remote/info');
      if (!result.ok) return failedResult('Failed to get remote info', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting remote info');
    }
  },
});

export const elasticGetNodes = tool({
  description: 'Get node info (roles, versions, plugins, hardware). Filter by metric/node ID.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    metric: z.string().optional().describe('Metrics subset, e.g. http,ingest,process'),
    nodeId: z.string().optional().describe('Node ID(s) filter'),
  }),
  execute: async ({ elasticCredentials, metric, nodeId }) => {
    try {
      const path = `/_nodes${nodeId ? `/${nodeId}` : ''}${metric ? `/${metric}` : ''}`;
      const result = await elasticRequest(elasticCredentials, path);
      if (!result.ok) return failedResult('Failed to get nodes', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting nodes');
    }
  },
});

export const elasticGetNodesStats = tool({
  description: 'Get node stats (JVM, OS, indices, thread pools, breakers).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    metric: z.string().optional().describe('Metrics subset, e.g. jvm,os,indices,thread_pool'),
    nodeId: z.string().optional().describe('Node ID(s) filter'),
  }),
  execute: async ({ elasticCredentials, metric, nodeId }) => {
    try {
      const path = `/_nodes${nodeId ? `/${nodeId}` : ''}/stats${metric ? `/${metric}` : ''}`;
      const result = await elasticRequest(elasticCredentials, path);
      if (!result.ok) return failedResult('Failed to get node stats', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting node stats');
    }
  },
});

export const elasticListTasks = tool({
  description: 'List running tasks (searches, reindex, snapshots) with actions and runtimes.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    actions: z.string().optional().describe('Actions filter, e.g. *search,*reindex'),
    detailed: z.boolean().optional().describe('Include detailed task descriptions'),
  }),
  execute: async ({ elasticCredentials, actions, detailed }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_tasks', {
        query: { actions, detailed },
      });
      if (!result.ok) return failedResult('Failed to list tasks', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing tasks');
    }
  },
});

export const elasticGetTask = tool({
  description: 'Get one task with status and records.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    taskId: z.string().describe('Task ID, e.g. node:123'),
  }),
  execute: async ({ elasticCredentials, taskId }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_tasks/${taskId}`);
      if (!result.ok) return failedResult('Failed to get task', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting task');
    }
  },
});

export const elasticCancelTask = tool({
  description: 'Cancel a running task (long search, reindex, snapshot).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    taskId: z.string().describe('Task ID'),
  }),
  execute: async ({ elasticCredentials, taskId }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_tasks/${taskId}/_cancel`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to cancel task', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error canceling task');
    }
  },
});

export const elasticCatHealth = tool({
  description: 'Compact cluster health table (epoch, status, shards, pending tasks).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_cat/health', {
        query: { format: 'json' },
      });
      if (!result.ok) return failedResult('Failed to get CAT health', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting CAT health');
    }
  },
});

export const elasticCatIndices = tool({
  description:
    'Compact index table: health, docs, store size, pri/rep shards. Use to audit storage.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Index pattern filter'),
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        index ? `/_cat/indices/${index}` : '/_cat/indices',
        { query: { format: 'json', bytes: 'b' } },
      );
      if (!result.ok) return failedResult('Failed to get CAT indices', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting CAT indices');
    }
  },
});

export const elasticCatNodes = tool({
  description: 'Compact node table: heap, RAM, CPU, load, roles.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_cat/nodes', {
        query: { format: 'json' },
      });
      if (!result.ok) return failedResult('Failed to get CAT nodes', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting CAT nodes');
    }
  },
});

export const elasticCatShards = tool({
  description:
    'Compact shard table: index, shard, state, docs, node. Use to find unassigned shards.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    index: z.string().optional().describe('Index pattern filter'),
  }),
  execute: async ({ elasticCredentials, index }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        index ? `/_cat/shards/${index}` : '/_cat/shards',
        { query: { format: 'json' } },
      );
      if (!result.ok) return failedResult('Failed to get CAT shards', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting CAT shards');
    }
  },
});

export const elasticCatAliases = tool({
  description: 'Compact alias table: alias, index, routing, filter.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    alias: z.string().optional().describe('Alias pattern filter'),
  }),
  execute: async ({ elasticCredentials, alias }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        alias ? `/_cat/aliases/${alias}` : '/_cat/aliases',
        { query: { format: 'json' } },
      );
      if (!result.ok) return failedResult('Failed to get CAT aliases', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting CAT aliases');
    }
  },
});
