import { tool } from 'ai';
import { z } from 'zod';
import { DeleteCacheParameterGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDeleteCacheParameterGroup = tool({
  description: 'Delete a cache parameter group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheParameterGroupName: z.string().describe('Parameter group name to delete'),
  }),
  execute: async ({ awsCredentials, region, cacheParameterGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DeleteCacheParameterGroupCommand({
          CacheParameterGroupName: cacheParameterGroupName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete a cache parameter group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
