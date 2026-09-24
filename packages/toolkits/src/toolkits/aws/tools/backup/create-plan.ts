import { tool } from 'ai';
import { z } from 'zod';
import { CreateBackupPlanCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsCreateBackupPlan = tool({
  description: 'Create a new backup plan. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlan: z.record(z.any()).describe('Backup plan configuration'),
    backupPlanTags: z.record(z.any()).optional().describe('Tags to assign to the backup plan'),
    creatorRequestId: z.string().optional().describe('A unique string that identifies the request'),
  }),
  execute: async ({ awsCredentials, region, backupPlan, backupPlanTags, creatorRequestId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new CreateBackupPlanCommand({
          BackupPlan: backupPlan,
          BackupPlanTags: backupPlanTags,
          CreatorRequestId: creatorRequestId,
      } as any);
      const response = await client.send(command);
      return {
                  backupPlanId: response.BackupPlanId,
                  backupPlanArn: response.BackupPlanArn,
                  creationDate: response.CreationDate,
                  versionId: response.VersionId,
              };
    } catch (err) {
      return { error: 'Failed to create a new backup plan', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
