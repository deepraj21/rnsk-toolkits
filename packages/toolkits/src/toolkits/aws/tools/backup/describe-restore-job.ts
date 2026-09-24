import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRestoreJobCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDescribeRestoreJob = tool({
  description: 'Get details about a restore job. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restoreJobId: z.string().describe('The ID of the restore job'),
  }),
  execute: async ({ awsCredentials, region, restoreJobId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DescribeRestoreJobCommand({
          RestoreJobId: restoreJobId,
      });
      const response = await client.send(command);
      return {
                  restoreJobId: response.RestoreJobId,
                  recoveryPointArn: response.RecoveryPointArn,
                  creationDate: response.CreationDate,
                  status: response.Status,
                  statusMessage: response.StatusMessage,
                  percentDone: response.PercentDone,
                  backupSizeInBytes: response.BackupSizeInBytes,
                  iamRoleArn: response.IamRoleArn,
                  expectedCompletionTimeMinutes: response.ExpectedCompletionTimeMinutes,
                  createdResourceArn: response.CreatedResourceArn,
                  resourceType: response.ResourceType,
              };
    } catch (err) {
      return { error: 'Failed to get details about a restore job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
