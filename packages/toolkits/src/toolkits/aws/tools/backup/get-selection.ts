import { tool } from 'ai';
import { z } from 'zod';
import { GetBackupSelectionCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsGetBackupSelection = tool({
  description: 'Get details about a backup selection. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlanId: z.string().describe('The ID of the backup plan'),
    selectionId: z.string().describe('The ID of the backup selection'),
  }),
  execute: async ({ awsCredentials, region, backupPlanId, selectionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new GetBackupSelectionCommand({
          BackupPlanId: backupPlanId,
          SelectionId: selectionId,
      });
      const response = await client.send(command);
      return {
                  backupSelection: response.BackupSelection,
                  selectionId: response.SelectionId,
                  backupPlanId: response.BackupPlanId,
                  creationDate: response.CreationDate,
                  creatorRequestId: response.CreatorRequestId,
              };
    } catch (err) {
      return { error: 'Failed to get details about a backup selection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
