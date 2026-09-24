import { tool } from 'ai';
import { z } from 'zod';
import { DeleteSnapshotCommand } from '@aws-sdk/client-elasticache';
import { createElastiCacheClient } from '../client.js';

export const awsDeleteSnapshot = tool({
  description: 'Delete a Redis snapshot. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotName: z.string().describe('Snapshot name to delete'),
  }),
  execute: async ({ awsCredentials, region, snapshotName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createElastiCacheClient(awsCredentials, region);

      const command = new DeleteSnapshotCommand({
          SnapshotName: snapshotName,
      });
      const response = await client.send(command);
      return response.Snapshot;
    } catch (err) {
      return { error: 'Failed to delete a Redis snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
