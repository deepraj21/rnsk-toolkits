import { tool } from 'ai';
import { z } from 'zod';
import { DescribeSnapshotsCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDescribeSnapshots = tool({
  description: 'List Redis snapshots. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replicationGroupId: z.string().optional().describe('Filter by replication group ID'),
    cacheClusterId: z.string().optional().describe('Filter by cache cluster ID'),
    snapshotName: z.string().optional().describe('Filter by specific snapshot name'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, replicationGroupId, cacheClusterId, snapshotName, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DescribeSnapshotsCommand({
          ReplicationGroupId: replicationGroupId,
          CacheClusterId: cacheClusterId,
          SnapshotName: snapshotName,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.Snapshots;
    } catch (err) {
      return { error: 'Failed to list Redis snapshots', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
