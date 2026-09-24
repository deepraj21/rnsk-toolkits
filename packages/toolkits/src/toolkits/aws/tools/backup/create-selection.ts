import { tool } from 'ai';
import { z } from 'zod';
import { CreateBackupSelectionCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsCreateBackupSelection = tool({
  description: 'Create a backup selection. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlanId: z.string().describe('The ID of the backup plan'),
    backupSelection: z.record(z.any()).describe('Backup selection configuration'),
    creatorRequestId: z.string().optional().describe('A unique string that identifies the request'),
  }),
  execute: async ({ awsCredentials, region, backupPlanId, backupSelection, creatorRequestId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new CreateBackupSelectionCommand({
          BackupPlanId: backupPlanId,
          BackupSelection: backupSelection,
          CreatorRequestId: creatorRequestId,
      } as any);
      const response = await client.send(command);
      return {
                  selectionId: response.SelectionId,
                  backupPlanId: response.BackupPlanId,
                  creationDate: response.CreationDate,
              };
    } catch (err) {
      return { error: 'Failed to create a backup selection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
