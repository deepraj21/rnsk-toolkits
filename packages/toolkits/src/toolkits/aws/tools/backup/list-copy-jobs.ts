import { tool } from 'ai';
import { z } from 'zod';
import { ListCopyJobsCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsListCopyJobs = tool({
  description: 'List copy jobs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of jobs to return'),
    byResourceArn: z.string().optional().describe('Filter by resource ARN'),
    byState: z.enum(['CREATED', 'RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL']).optional().describe('Filter by job state'),
    byCreatedBefore: z.string().optional().describe('Filter by created before date'),
    byCreatedAfter: z.string().optional().describe('Filter by created after date'),
    byResourceType: z.string().optional().describe('Filter by resource type'),
    byDestinationVaultArn: z.string().optional().describe('Filter by destination vault ARN'),
    byAccountId: z.string().optional().describe('Filter by account ID'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, byResourceArn, byState, byCreatedBefore, byCreatedAfter, byResourceType, byDestinationVaultArn, byAccountId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new ListCopyJobsCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          ByResourceArn: byResourceArn,
          ByState: byState,
          ByCreatedBefore: byCreatedBefore ? new Date(byCreatedBefore) : undefined,
          ByCreatedAfter: byCreatedAfter ? new Date(byCreatedAfter) : undefined,
          ByResourceType: byResourceType,
          ByDestinationVaultArn: byDestinationVaultArn,
          ByAccountId: byAccountId,
      });
      const response = await client.send(command);
      return {
                  copyJobs: response.CopyJobs || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list copy jobs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
