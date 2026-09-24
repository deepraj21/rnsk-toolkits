import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDBSnapshotCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDeleteDbSnapshot = tool({
  description: 'Delete an RDS database snapshot. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbSnapshotIdentifier: z.string().describe('Snapshot identifier to delete'),
  }),
  execute: async ({ awsCredentials, region, dbSnapshotIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DeleteDBSnapshotCommand({
          DBSnapshotIdentifier: dbSnapshotIdentifier,
      });
      const response = await client.send(command);
      return response.DBSnapshot;
    } catch (err) {
      return { error: 'Failed to delete an RDS database snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
