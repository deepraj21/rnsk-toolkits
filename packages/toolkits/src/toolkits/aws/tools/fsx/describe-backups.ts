import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBackupsCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDescribeFsxBackups = tool({
  description: 'Get details about one or more FSx backups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupIds: z.array(z.string()).optional().describe('List of backup IDs to describe (optional, lists all if not provided)'),
    filters: z.array(z.record(z.any())).optional().describe('Filters to apply'),
    maxResults: z.number().optional().describe('Maximum number of backups to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, backupIds, filters, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DescribeBackupsCommand({
          BackupIds: backupIds,
          Filters: filters,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  backups: response.Backups || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more FSx backups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
