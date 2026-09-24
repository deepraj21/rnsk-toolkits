import { tool } from 'ai';
import { z } from 'zod';
import { GetBackupPlanCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsGetBackupPlan = tool({
  description: 'Get details about a backup plan. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlanId: z.string().describe('The ID of the backup plan'),
    versionId: z.string().optional().describe('The version ID of the backup plan'),
  }),
  execute: async ({ awsCredentials, region, backupPlanId, versionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new GetBackupPlanCommand({
          BackupPlanId: backupPlanId,
          VersionId: versionId,
      });
      const response = await client.send(command);
      return {
                  backupPlan: response.BackupPlan,
                  backupPlanId: response.BackupPlanId,
                  backupPlanArn: response.BackupPlanArn,
                  versionId: response.VersionId,
                  creatorRequestId: response.CreatorRequestId,
                  creationDate: response.CreationDate,
                  deletionDate: response.DeletionDate,
                  lastExecutionDate: response.LastExecutionDate,
                  advancedBackupSettings: response.AdvancedBackupSettings,
              };
    } catch (err) {
      return { error: 'Failed to get details about a backup plan', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
