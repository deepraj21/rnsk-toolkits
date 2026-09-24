import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBackupJobCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDescribeBackupJob = tool({
  description: 'Get details about a backup job. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupJobId: z.string().describe('The ID of the backup job'),
  }),
  execute: async ({ awsCredentials, region, backupJobId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DescribeBackupJobCommand({
          BackupJobId: backupJobId,
      });
      const response = await client.send(command);
      return {
                  backupJobId: response.BackupJobId,
                  backupVaultName: response.BackupVaultName,
                  backupVaultArn: response.BackupVaultArn,
                  recoveryPointArn: response.RecoveryPointArn,
                  resourceArn: response.ResourceArn,
                  creationDate: response.CreationDate,
                  state: response.State,
                  statusMessage: response.StatusMessage,
                  percentDone: response.PercentDone,
                  backupSizeInBytes: response.BackupSizeInBytes,
                  iamRoleArn: response.IamRoleArn,
                  expectedCompletionDate: response.ExpectedCompletionDate,
                  startBy: response.StartBy,
                  resourceType: response.ResourceType,
                  bytesTransferred: response.BytesTransferred,
              };
    } catch (err) {
      return { error: 'Failed to get details about a backup job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
