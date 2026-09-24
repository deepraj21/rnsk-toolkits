import { tool } from 'ai';
import { z } from 'zod';
import { IncreaseReplicaCountCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsIncreaseReplicaCount = tool({
  description: 'Add read replicas to a Redis replication group. Use it to scale capacity.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replicationGroupId: z.string().describe('Replication group ID'),
    newReplicaCount: z.number().describe('New total replica count'),
    applyImmediately: z.boolean().describe('Apply changes immediately'),
  }),
  execute: async ({ awsCredentials, region, replicationGroupId, newReplicaCount, applyImmediately }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new IncreaseReplicaCountCommand({
          ReplicationGroupId: replicationGroupId,
          NewReplicaCount: newReplicaCount,
          ApplyImmediately: applyImmediately,
      });
      const response = await client.send(command);
      return response.ReplicationGroup;
    } catch (err) {
      return { error: 'Failed to add read replicas to a Redis replication group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
