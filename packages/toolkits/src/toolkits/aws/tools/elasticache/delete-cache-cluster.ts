import { tool } from 'ai';
import { z } from 'zod';
import { DeleteCacheClusterCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDeleteCacheCluster = tool({
  description: 'Delete a Memcached cache cluster. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheClusterId: z.string().describe('Cache cluster ID to delete'),
  }),
  execute: async ({ awsCredentials, region, cacheClusterId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DeleteCacheClusterCommand({
          CacheClusterId: cacheClusterId,
      });
      const response = await client.send(command);
      return response.CacheCluster;
    } catch (err) {
      return { error: 'Failed to delete a Memcached cache cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
