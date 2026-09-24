import { tool } from 'ai';
import { z } from 'zod';
import { RebootCacheClusterCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsRebootCacheCluster = tool({
  description: 'Reboot cache cluster nodes. Use it to restart the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheClusterId: z.string().describe('Cache cluster ID to reboot'),
    cacheNodeIdsToReboot: z.array(z.string()).describe('List of cache node IDs to reboot'),
  }),
  execute: async ({ awsCredentials, region, cacheClusterId, cacheNodeIdsToReboot }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new RebootCacheClusterCommand({
          CacheClusterId: cacheClusterId,
          CacheNodeIdsToReboot: cacheNodeIdsToReboot,
      });
      const response = await client.send(command);
      return response.CacheCluster;
    } catch (err) {
      return { error: 'Failed to reboot cache cluster nodes', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
