import { tool } from 'ai';
import { z } from 'zod';
import { UpdateBackupPlanCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsUpdateBackupPlan = tool({
  description: 'Update a backup plan. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlanId: z.string().describe('The ID of the backup plan'),
    backupPlan: z.record(z.any()).describe('Updated backup plan configuration'),
  }),
  execute: async ({ awsCredentials, region, backupPlanId, backupPlan }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new UpdateBackupPlanCommand({
          BackupPlanId: backupPlanId,
          BackupPlan: backupPlan,
      } as any);
      const response = await client.send(command);
      return {
                  backupPlanId: response.BackupPlanId,
                  backupPlanArn: response.BackupPlanArn,
                  creationDate: response.CreationDate,
                  versionId: response.VersionId,
              };
    } catch (err) {
      return { error: 'Failed to update a backup plan', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
