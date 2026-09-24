import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRecoveryPointCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDeleteRecoveryPoint = tool({
  description: 'Delete a recovery point. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
    recoveryPointArn: z.string().describe('The ARN of the recovery point to delete'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName, recoveryPointArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DeleteRecoveryPointCommand({
          BackupVaultName: backupVaultName,
          RecoveryPointArn: recoveryPointArn,
      });
      await client.send(command);
      return {
                  message: 'Recovery point deleted successfully',
                  backupVaultName: backupVaultName,
                  recoveryPointArn: recoveryPointArn,
              };
    } catch (err) {
      return { error: 'Failed to delete a recovery point', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
