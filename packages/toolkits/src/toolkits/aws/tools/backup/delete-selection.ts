import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBackupSelectionCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsDeleteBackupSelection = tool({
  description: 'Delete a backup selection. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlanId: z.string().describe('The ID of the backup plan'),
    selectionId: z.string().describe('The ID of the backup selection to delete'),
  }),
  execute: async ({ awsCredentials, region, backupPlanId, selectionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new DeleteBackupSelectionCommand({
          BackupPlanId: backupPlanId,
          SelectionId: selectionId,
      });
      await client.send(command);
      return {
                  message: 'Backup selection deleted successfully',
                  backupPlanId: backupPlanId,
                  selectionId: selectionId,
              };
    } catch (err) {
      return { error: 'Failed to delete a backup selection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
