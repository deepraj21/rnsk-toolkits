import { tool } from 'ai';
import { z } from 'zod';
import { ModifyCacheClusterCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsModifyCacheCluster = tool({
  description: 'Modify a Memcached cache cluster. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheClusterId: z.string().describe('Cache cluster ID to modify'),
    numCacheNodes: z.number().optional().describe('New number of cache nodes'),
    cacheNodeType: z.string().optional().describe('New node type'),
    applyImmediately: z.boolean().optional().describe('Apply changes immediately or during maintenance window'),
  }),
  execute: async ({ awsCredentials, region, cacheClusterId, numCacheNodes, cacheNodeType, applyImmediately }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new ModifyCacheClusterCommand({
          CacheClusterId: cacheClusterId,
          NumCacheNodes: numCacheNodes,
          CacheNodeType: cacheNodeType,
          ApplyImmediately: applyImmediately,
      });
      const response = await client.send(command);
      return response.CacheCluster;
    } catch (err) {
      return { error: 'Failed to modify a Memcached cache cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
