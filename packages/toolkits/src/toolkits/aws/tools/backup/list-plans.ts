import { tool } from 'ai';
import { z } from 'zod';
import { ListBackupPlansCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsListBackupPlans = tool({
  description: 'List all backup plans. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of plans to return'),
    includeDeleted: z.boolean().optional().describe('Include deleted backup plans'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, includeDeleted }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new ListBackupPlansCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          IncludeDeleted: includeDeleted,
      });
      const response = await client.send(command);
      return {
                  backupPlansList: response.BackupPlansList || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all backup plans', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
