import { tool } from 'ai';
import { z } from 'zod';
import { CreateCacheSubnetGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsCreateCacheSubnetGroup = tool({
  description: 'Create a cache subnet group for VPC. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cacheSubnetGroupName: z.string().describe('Subnet group name'),
    cacheSubnetGroupDescription: z.string().describe('Description of the subnet group'),
    subnetIds: z.array(z.string()).describe('List of subnet IDs'),
  }),
  execute: async ({ awsCredentials, region, cacheSubnetGroupName, cacheSubnetGroupDescription, subnetIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new CreateCacheSubnetGroupCommand({
          CacheSubnetGroupName: cacheSubnetGroupName,
          CacheSubnetGroupDescription: cacheSubnetGroupDescription,
          SubnetIds: subnetIds,
      });
      const response = await client.send(command);
      return response.CacheSubnetGroup;
    } catch (err) {
      return { error: 'Failed to create a cache subnet group for VPC', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
