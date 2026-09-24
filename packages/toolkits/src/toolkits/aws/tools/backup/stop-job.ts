import { tool } from 'ai';
import { z } from 'zod';
import { StopBackupJobCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsStopBackupJob = tool({
  description: 'Stop a backup job. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupJobId: z.string().describe('The ID of the backup job to stop'),
  }),
  execute: async ({ awsCredentials, region, backupJobId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new StopBackupJobCommand({
          BackupJobId: backupJobId,
      });
      await client.send(command);
      return {
                  message: 'Backup job stopped successfully',
                  backupJobId: backupJobId,
              };
    } catch (err) {
      return { error: 'Failed to stop a backup job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
