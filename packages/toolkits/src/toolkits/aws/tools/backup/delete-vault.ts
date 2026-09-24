import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBackupVaultCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDeleteBackupVault = tool({
  description: 'Delete a backup vault. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault to delete'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DeleteBackupVaultCommand({
          BackupVaultName: backupVaultName,
      });
      await client.send(command);
      return {
                  message: 'Backup vault deleted successfully',
                  backupVaultName: backupVaultName,
              };
    } catch (err) {
      return { error: 'Failed to delete a backup vault', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
