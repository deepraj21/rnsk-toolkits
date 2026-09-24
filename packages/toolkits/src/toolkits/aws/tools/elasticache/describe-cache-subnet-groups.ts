import { tool } from 'ai';
import { z } from 'zod';
import { DescribeCacheSubnetGroupsCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDescribeCacheSubnetGroups = tool({
  description: 'List all cache subnet groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheSubnetGroupName: z.string().optional().describe('Filter by specific subnet group name'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, cacheSubnetGroupName, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DescribeCacheSubnetGroupsCommand({
          CacheSubnetGroupName: cacheSubnetGroupName,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.CacheSubnetGroups;
    } catch (err) {
      return { error: 'Failed to list all cache subnet groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
