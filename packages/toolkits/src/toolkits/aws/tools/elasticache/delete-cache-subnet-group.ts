import { tool } from 'ai';
import { z } from 'zod';
import { DeleteCacheSubnetGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDeleteCacheSubnetGroup = tool({
  description: 'Delete a cache subnet group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheSubnetGroupName: z.string().describe('Subnet group name to delete'),
  }),
  execute: async ({ awsCredentials, region, cacheSubnetGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DeleteCacheSubnetGroupCommand({
          CacheSubnetGroupName: cacheSubnetGroupName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete a cache subnet group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
