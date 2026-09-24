import { tool } from 'ai';
import { z } from 'zod';
import { DescribeCacheParametersCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDescribeCacheParameters = tool({
  description: 'List all parameters in a cache parameter group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheParameterGroupName: z.string().describe('Parameter group name'),
    source: z.string().optional().describe('Filter by source (user, system, engine-default)'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, cacheParameterGroupName, source, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DescribeCacheParametersCommand({
          CacheParameterGroupName: cacheParameterGroupName,
          Source: source,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.Parameters;
    } catch (err) {
      return { error: 'Failed to list all parameters in a cache parameter group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
