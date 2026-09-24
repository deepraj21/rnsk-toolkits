import { tool } from 'ai';
import { z } from 'zod';
import { CreateBackupVaultCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsCreateBackupVault = tool({
  description: 'Create a new backup vault. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
    backupVaultTags: z.record(z.any()).optional().describe('Metadata tags to assign to the backup vault'),
    encryptionKeyArn: z.string().optional().describe('The server-side encryption key that is used to protect your backups'),
    creatorRequestId: z.string().optional().describe('A unique string that identifies the request'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName, backupVaultTags, encryptionKeyArn, creatorRequestId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new CreateBackupVaultCommand({
          BackupVaultName: backupVaultName,
          BackupVaultTags: backupVaultTags,
          EncryptionKeyArn: encryptionKeyArn,
          CreatorRequestId: creatorRequestId,
      });
      const response = await client.send(command);
      return {
                  backupVaultName: response.BackupVaultName,
                  backupVaultArn: response.BackupVaultArn,
                  creationDate: response.CreationDate,
              };
    } catch (err) {
      return { error: 'Failed to create a new backup vault', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
