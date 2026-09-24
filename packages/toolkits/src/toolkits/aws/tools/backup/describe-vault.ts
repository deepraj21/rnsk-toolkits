import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBackupVaultCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDescribeBackupVault = tool({
  description: 'Get details about a backup vault. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
    backupVaultAccountId: z.string().optional().describe('The account ID of the backup vault'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName, backupVaultAccountId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DescribeBackupVaultCommand({
          BackupVaultName: backupVaultName,
          BackupVaultAccountId: backupVaultAccountId,
      });
      const response = await client.send(command);
      return {
                  backupVaultName: response.BackupVaultName,
                  backupVaultArn: response.BackupVaultArn,
                  encryptionKeyArn: response.EncryptionKeyArn,
                  creationDate: response.CreationDate,
                  creatorRequestId: response.CreatorRequestId,
                  numberOfRecoveryPoints: response.NumberOfRecoveryPoints,
                  locked: response.Locked,
                  minRetentionDays: response.MinRetentionDays,
                  maxRetentionDays: response.MaxRetentionDays,
                  lockDate: response.LockDate,
              };
    } catch (err) {
      return { error: 'Failed to get details about a backup vault', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
