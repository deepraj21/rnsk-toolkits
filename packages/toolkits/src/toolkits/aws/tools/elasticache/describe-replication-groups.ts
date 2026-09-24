import { tool } from 'ai';
import { z } from 'zod';
import { DescribeReplicationGroupsCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDescribeReplicationGroups = tool({
  description: 'List all Redis replication groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replicationGroupId: z.string().optional().describe('Filter by specific replication group ID'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, replicationGroupId, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DescribeReplicationGroupsCommand({
          ReplicationGroupId: replicationGroupId,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.ReplicationGroups;
    } catch (err) {
      return { error: 'Failed to list all Redis replication groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
