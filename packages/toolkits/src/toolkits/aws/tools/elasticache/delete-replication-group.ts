import { tool } from 'ai';
import { z } from 'zod';
import { DeleteReplicationGroupCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDeleteReplicationGroup = tool({
  description: 'Delete a Redis replication group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replicationGroupId: z.string().describe('Replication group ID to delete'),
    retainPrimaryCluster: z.boolean().optional().describe('Retain primary cluster after deletion'),
    finalSnapshotIdentifier: z.string().optional().describe('Create final snapshot before deletion'),
  }),
  execute: async ({ awsCredentials, region, replicationGroupId, retainPrimaryCluster, finalSnapshotIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DeleteReplicationGroupCommand({
          ReplicationGroupId: replicationGroupId,
          RetainPrimaryCluster: retainPrimaryCluster,
          FinalSnapshotIdentifier: finalSnapshotIdentifier,
      });
      const response = await client.send(command);
      return response.ReplicationGroup;
    } catch (err) {
      return { error: 'Failed to delete a Redis replication group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
