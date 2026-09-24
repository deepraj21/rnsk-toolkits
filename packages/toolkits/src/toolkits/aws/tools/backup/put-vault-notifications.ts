import { tool } from 'ai';
import { z } from 'zod';
import { PutBackupVaultNotificationsCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsPutBackupVaultNotifications = tool({
  description: 'Set notification settings for a backup vault. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
    snsTopicArn: z.string().describe('The ARN of the SNS topic'),
    backupVaultEvents: z.array(z.enum(['BACKUP_JOB_STARTED', 'BACKUP_JOB_COMPLETED', 'BACKUP_JOB_SUCCESSFUL', 'BACKUP_JOB_FAILED', 'BACKUP_JOB_EXPIRED', 'RESTORE_JOB_STARTED', 'RESTORE_JOB_COMPLETED', 'RESTORE_JOB_SUCCESSFUL', 'RESTORE_JOB_FAILED', 'COPY_JOB_STARTED', 'COPY_JOB_SUCCESSFUL', 'COPY_JOB_FAILED', 'RECOVERY_POINT_MODIFIED', 'BACKUP_PLAN_CREATED', 'BACKUP_PLAN_MODIFIED'])).describe('Backup vault events to notify on'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName, snsTopicArn, backupVaultEvents }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new PutBackupVaultNotificationsCommand({
          BackupVaultName: backupVaultName,
          SNSTopicArn: snsTopicArn,
          BackupVaultEvents: backupVaultEvents,
      });
      await client.send(command);
      return {
                  message: 'Backup vault notifications updated successfully',
                  backupVaultName: backupVaultName,
              };
    } catch (err) {
      return { error: 'Failed to set notification settings for a backup vault', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
