import { tool } from 'ai';
import { z } from 'zod';
import { UpdateSnapshotCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsUpdateFsxSnapshot = tool({
  description: 'Update a snapshot. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
    name: z.string().optional().describe('New name for the snapshot'),
    snapshotId: z.string().describe('The ID of the snapshot'),
  }),
  execute: async ({ awsCredentials, region, clientRequestToken, name, snapshotId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new UpdateSnapshotCommand({
          ClientRequestToken: clientRequestToken,
          Name: name,
          SnapshotId: snapshotId,
      });
      const response = await client.send(command);
      return {
                  snapshot: response.Snapshot,
              };
    } catch (err) {
      return { error: 'Failed to update a snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
