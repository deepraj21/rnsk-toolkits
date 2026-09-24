import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRecoveryPointCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDescribeRecoveryPoint = tool({
  description: 'Get details about a recovery point. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
    recoveryPointArn: z.string().describe('The ARN of the recovery point'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName, recoveryPointArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DescribeRecoveryPointCommand({
          BackupVaultName: backupVaultName,
          RecoveryPointArn: recoveryPointArn,
      });
      const response = await client.send(command);
      return {
                  recoveryPointArn: response.RecoveryPointArn,
                  backupVaultName: response.BackupVaultName,
                  backupVaultArn: response.BackupVaultArn,
                  resourceArn: response.ResourceArn,
                  resourceType: response.ResourceType,
                  createdBy: response.CreatedBy,
                  iamRoleArn: response.IamRoleArn,
                  status: response.Status,
                  statusMessage: response.StatusMessage,
                  creationDate: response.CreationDate,
                  completionDate: response.CompletionDate,
                  backupSizeInBytes: response.BackupSizeInBytes,
                  calculatedLifecycle: response.CalculatedLifecycle,
                  lifecycle: response.Lifecycle,
                  encryptionKeyArn: response.EncryptionKeyArn,
                  isEncrypted: response.IsEncrypted,
                  lastRestoreTime: response.LastRestoreTime,
              };
    } catch (err) {
      return { error: 'Failed to get details about a recovery point', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
