import { tool } from 'ai';
import { z } from 'zod';
import { DeleteSnapshotCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDeleteFsxSnapshot = tool({
  description: 'Delete a snapshot. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    snapshotId: z.string().describe('The ID of the snapshot to delete'),
  }),
  execute: async ({ awsCredentials, region, clientRequestToken, snapshotId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DeleteSnapshotCommand({
          ClientRequestToken: clientRequestToken,
          SnapshotId: snapshotId,
      });
      const response = await client.send(command);
      return {
                  snapshotId: response.SnapshotId,
                  lifeCycle: response.Lifecycle,
              };
    } catch (err) {
      return { error: 'Failed to delete a snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
