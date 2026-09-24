import { tool } from 'ai';
import { z } from 'zod';
import { GetBackupPlanFromTemplateCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsGetBackupPlanFromTemplate = tool({
  description: 'Get a backup plan from a template. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlanTemplateId: z.string().describe('The ID of the backup plan template'),
  }),
  execute: async ({ awsCredentials, region, backupPlanTemplateId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new GetBackupPlanFromTemplateCommand({
          BackupPlanTemplateId: backupPlanTemplateId,
      });
      const response = await client.send(command);
      return {
                  backupPlanDocument: response.BackupPlanDocument,
              };
    } catch (err) {
      return { error: 'Failed to get a backup plan from a template', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
