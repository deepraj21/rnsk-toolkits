import { tool } from 'ai';
import { z } from 'zod';
import { ListBackupJobsCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsListBackupJobs = tool({
  description: 'List backup jobs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of jobs to return'),
    byResourceArn: z.string().optional().describe('Filter by resource ARN'),
    byState: z.enum(['CREATED', 'PENDING', 'RUNNING', 'ABORTING', 'ABORTED', 'COMPLETED', 'FAILED', 'EXPIRED']).optional().describe('Filter by job state'),
    byBackupVaultName: z.string().optional().describe('Filter by backup vault name'),
    byCreatedBefore: z.string().optional().describe('Filter by created before date'),
    byCreatedAfter: z.string().optional().describe('Filter by created after date'),
    byResourceType: z.string().optional().describe('Filter by resource type'),
    byAccountId: z.string().optional().describe('Filter by account ID'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults, byResourceArn, byState, byBackupVaultName, byCreatedBefore, byCreatedAfter, byResourceType, byAccountId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new ListBackupJobsCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
          ByResourceArn: byResourceArn,
          ByState: byState,
          ByBackupVaultName: byBackupVaultName,
          ByCreatedBefore: byCreatedBefore ? new Date(byCreatedBefore) : undefined,
          ByCreatedAfter: byCreatedAfter ? new Date(byCreatedAfter) : undefined,
          ByResourceType: byResourceType,
          ByAccountId: byAccountId,
      });
      const response = await client.send(command);
      return {
                  backupJobs: response.BackupJobs || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list backup jobs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
