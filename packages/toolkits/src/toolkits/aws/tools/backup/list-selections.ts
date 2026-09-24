import { tool } from 'ai';
import { z } from 'zod';
import { ListBackupSelectionsCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsListBackupSelections = tool({
  description: 'List backup selections for a backup plan. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupPlanId: z.string().describe('The ID of the backup plan'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of selections to return'),
  }),
  execute: async ({ awsCredentials, region, backupPlanId, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new ListBackupSelectionsCommand({
          BackupPlanId: backupPlanId,
          NextToken: nextToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  backupSelectionsList: response.BackupSelectionsList || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list backup selections for a backup plan', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
