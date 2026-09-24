import { tool } from 'ai';
import { z } from 'zod';
import { ModifyReplicationGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsModifyReplicationGroup = tool({
  description: 'Modify a Redis replication group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replicationGroupId: z.string().describe('Replication group ID to modify'),
    replicationGroupDescription: z.string().optional().describe('New description'),
    automaticFailoverEnabled: z.boolean().optional().describe('Enable/disable automatic failover'),
    cacheNodeType: z.string().optional().describe('New node type'),
    applyImmediately: z.boolean().optional().describe('Apply changes immediately'),
  }),
  execute: async ({ awsCredentials, region, replicationGroupId, replicationGroupDescription, automaticFailoverEnabled, cacheNodeType, applyImmediately }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new ModifyReplicationGroupCommand({
          ReplicationGroupId: replicationGroupId,
          ReplicationGroupDescription: replicationGroupDescription,
          AutomaticFailoverEnabled: automaticFailoverEnabled,
          CacheNodeType: cacheNodeType,
          ApplyImmediately: applyImmediately,
      });
      const response = await client.send(command);
      return response.ReplicationGroup;
    } catch (err) {
      return { error: 'Failed to modify a Redis replication group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
