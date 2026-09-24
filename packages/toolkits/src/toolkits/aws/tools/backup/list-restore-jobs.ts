import { tool } from 'ai';
import { z } from 'zod';
import { ListRestoreJobsCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsListRestoreJobs = tool({
  description: 'List restore jobs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of jobs to return'),
    byAccountId: z.string().optional().describe('Filter by account ID'),
    byResourceType: z.string().optional().describe('Filter by resource type'),
    byCreatedBefore: z.string().optional().describe('Filter by created before date'),
    byCreatedAfter: z.string().optional().describe('Filter by created after date'),
    byStatus: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'ABORTED', 'FAILED']).optional().describe('Filter by job status'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, byAccountId, byResourceType, byCreatedBefore, byCreatedAfter, byStatus }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new ListRestoreJobsCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          ByAccountId: byAccountId,
          ByResourceType: byResourceType,
          ByCreatedBefore: byCreatedBefore ? new Date(byCreatedBefore) : undefined,
          ByCreatedAfter: byCreatedAfter ? new Date(byCreatedAfter) : undefined,
          ByStatus: byStatus,
      });
      const response = await client.send(command);
      return {
                  restoreJobs: response.RestoreJobs || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list restore jobs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
