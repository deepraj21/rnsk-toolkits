import { tool } from 'ai';
import { z } from 'zod';
import { DescribeCacheParameterGroupsCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDescribeCacheParameterGroups = tool({
  description: 'List all cache parameter groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheParameterGroupName: z.string().optional().describe('Filter by specific parameter group name'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, cacheParameterGroupName, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DescribeCacheParameterGroupsCommand({
          CacheParameterGroupName: cacheParameterGroupName,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.CacheParameterGroups;
    } catch (err) {
      return { error: 'Failed to list all cache parameter groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
