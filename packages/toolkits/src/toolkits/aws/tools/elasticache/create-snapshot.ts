import { tool } from 'ai';
import { z } from 'zod';
import { CreateSnapshotCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsCreateSnapshot = tool({
  description: 'Create a backup snapshot of a Redis cluster. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotName: z.string().describe('Snapshot name'),
    replicationGroupId: z.string().optional().describe('Replication group ID to snapshot (optional if cacheClusterId provided)'),
    cacheClusterId: z.string().optional().describe('Cache cluster ID to snapshot (optional if replicationGroupId provided)'),
  }),
  execute: async ({ awsCredentials, region, snapshotName, replicationGroupId, cacheClusterId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new CreateSnapshotCommand({
          SnapshotName: snapshotName,
          ReplicationGroupId: replicationGroupId,
          CacheClusterId: cacheClusterId,
      });
      const response = await client.send(command);
      return response.Snapshot;
    } catch (err) {
      return { error: 'Failed to create a backup snapshot of a Redis cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
