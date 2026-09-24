import { tool } from 'ai';
import { z } from 'zod';
import { GetBackupVaultNotificationsCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsGetBackupVaultNotifications = tool({
  description: 'Get notification settings for a backup vault. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new GetBackupVaultNotificationsCommand({
          BackupVaultName: backupVaultName,
      });
      const response = await client.send(command);
      return {
                  backupVaultName: response.BackupVaultName,
                  backupVaultArn: response.BackupVaultArn,
                  snsTopicArn: response.SNSTopicArn,
                  backupVaultEvents: response.BackupVaultEvents || [],
              };
    } catch (err) {
      return { error: 'Failed to get notification settings for a backup vault', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
