import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBackupCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDeleteFsxBackup = tool({
  description: 'Delete an FSx backup. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupId: z.string().describe('The ID of the backup to delete'),
    clientRequestToken: z.string().optional().describe('Client request token for idempotency'),
  }),
  execute: async ({ awsCredentials, region, backupId, clientRequestToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DeleteBackupCommand({
          BackupId: backupId,
          ClientRequestToken: clientRequestToken,
      });
      const response = await client.send(command);
      return {
                  backupId: response.BackupId,
                  lifeCycle: response.Lifecycle,
              };
    } catch (err) {
      return { error: 'Failed to delete an FSx backup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
