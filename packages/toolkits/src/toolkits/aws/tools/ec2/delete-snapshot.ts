import { tool } from 'ai';
import { z } from 'zod';
import { DeleteSnapshotCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2Snapshot = tool({
  description: 'Delete an EC2 snapshot. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotId: z.string().describe('The ID of the snapshot'),
  }),
  execute: async ({ awsCredentials, region, snapshotId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteSnapshotCommand({ SnapshotId: snapshotId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete an EC2 snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
