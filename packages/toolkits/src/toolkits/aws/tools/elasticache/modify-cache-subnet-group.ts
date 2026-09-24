import { tool } from 'ai';
import { z } from 'zod';
import { ModifyCacheSubnetGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsModifyCacheSubnetGroup = tool({
  description: 'Modify a cache subnet group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheSubnetGroupName: z.string().describe('Subnet group name to modify'),
    cacheSubnetGroupDescription: z.string().optional().describe('New description'),
    subnetIds: z.array(z.string()).optional().describe('New list of subnet IDs'),
  }),
  execute: async ({ awsCredentials, region, cacheSubnetGroupName, cacheSubnetGroupDescription, subnetIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new ModifyCacheSubnetGroupCommand({
          CacheSubnetGroupName: cacheSubnetGroupName,
          CacheSubnetGroupDescription: cacheSubnetGroupDescription,
          SubnetIds: subnetIds,
      });
      const response = await client.send(command);
      return response.CacheSubnetGroup;
    } catch (err) {
      return { error: 'Failed to modify a cache subnet group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
