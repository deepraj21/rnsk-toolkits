import { tool } from 'ai';
import { z } from 'zod';
import { DescribeCacheClustersCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDescribeElasticacheCacheClusters = tool({
  description: 'List all ElastiCache cache clusters (Memcached and Redis). Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheClusterId: z.string().optional().describe('Filter by specific cache cluster ID'),
    maxRecords: z.number().optional().describe('Maximum number of records to return (20-100)'),
    showCacheNodeInfo: z.boolean().optional().describe('Include detailed cache node information'),
  }),
  execute: async ({ awsCredentials, region, cacheClusterId, maxRecords, showCacheNodeInfo }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DescribeCacheClustersCommand({
          CacheClusterId: cacheClusterId,
          MaxRecords: maxRecords,
          ShowCacheNodeInfo: showCacheNodeInfo,
      });
      const response = await client.send(command);
      return response.CacheClusters;
    } catch (err) {
      return { error: 'Failed to list all ElastiCache cache clusters (Memcached and Redis)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
