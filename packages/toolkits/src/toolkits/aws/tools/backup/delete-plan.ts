import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBackupPlanCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDeleteBackupPlan = tool({
  description: 'Delete a backup plan. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlanId: z.string().describe('The ID of the backup plan to delete'),
  }),
  execute: async ({ awsCredentials, region, backupPlanId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DeleteBackupPlanCommand({
          BackupPlanId: backupPlanId,
      });
      const response = await client.send(command);
      return {
                  backupPlanId: response.BackupPlanId,
                  backupPlanArn: response.BackupPlanArn,
                  deletionDate: response.DeletionDate,
                  versionId: response.VersionId,
              };
    } catch (err) {
      return { error: 'Failed to delete a backup plan', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
