import { tool } from 'ai';
import { z } from 'zod';
import { StartBackupJobCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsStartBackupJob = tool({
  description: 'Start a backup job. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
    resourceArn: z.string().describe('The ARN of the resource to backup'),
    iamRoleArn: z.string().describe('The ARN of the IAM role'),
    idempotencyToken: z.string().optional().describe('A unique token for idempotency'),
    startWindowMinutes: z.number().optional().describe('The start window in minutes'),
    completeWindowMinutes: z.number().optional().describe('The complete window in minutes'),
    lifecycle: z.record(z.any()).optional().describe('Lifecycle configuration'),
    recoveryPointTags: z.record(z.any()).optional().describe('Tags to assign to the recovery point'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName, resourceArn, iamRoleArn, idempotencyToken, startWindowMinutes, completeWindowMinutes, lifecycle, recoveryPointTags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new StartBackupJobCommand({
          BackupVaultName: backupVaultName,
          ResourceArn: resourceArn,
          IamRoleArn: iamRoleArn,
          IdempotencyToken: idempotencyToken,
          StartWindowMinutes: startWindowMinutes,
          CompleteWindowMinutes: completeWindowMinutes,
          Lifecycle: lifecycle,
          RecoveryPointTags: recoveryPointTags,
      });
      const response = await client.send(command);
      return {
                  backupJobId: response.BackupJobId,
                  recoveryPointArn: response.RecoveryPointArn,
                  creationDate: response.CreationDate,
              };
    } catch (err) {
      return { error: 'Failed to start a backup job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
