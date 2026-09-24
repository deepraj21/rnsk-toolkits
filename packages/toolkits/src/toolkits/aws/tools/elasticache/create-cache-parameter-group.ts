import { tool } from 'ai';
import { z } from 'zod';
import { CreateCacheParameterGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsCreateCacheParameterGroup = tool({
  description: 'Create a new cache parameter group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheParameterGroupName: z.string().describe('Parameter group name'),
    cacheParameterGroupFamily: z.string().describe('Parameter group family (e.g., redis7, memcached1.6)'),
    description: z.string().describe('Description of the parameter group'),
  }),
  execute: async ({ awsCredentials, region, cacheParameterGroupName, cacheParameterGroupFamily, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new CreateCacheParameterGroupCommand({
          CacheParameterGroupName: cacheParameterGroupName,
          CacheParameterGroupFamily: cacheParameterGroupFamily,
          Description: description,
      });
      const response = await client.send(command);
      return response.CacheParameterGroup;
    } catch (err) {
      return { error: 'Failed to create a new cache parameter group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
