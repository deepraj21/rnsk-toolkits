import { tool } from 'ai';
import { z } from 'zod';
import { PutBackupVaultAccessPolicyCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsPutBackupVaultAccessPolicy = tool({
  description: 'Set the access policy for a backup vault. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
    policy: z.string().describe('The access policy document'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName, policy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new PutBackupVaultAccessPolicyCommand({
          BackupVaultName: backupVaultName,
          Policy: policy,
      });
      await client.send(command);
      return {
                  message: 'Backup vault access policy updated successfully',
                  backupVaultName: backupVaultName,
              };
    } catch (err) {
      return { error: 'Failed to set the access policy for a backup vault', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
