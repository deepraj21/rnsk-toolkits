import { tool } from 'ai';
import { z } from 'zod';
import { ListRecoveryPointsByBackupVaultCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsListRecoveryPointsByBackupVault = tool({
  description: 'List recovery points in a backup vault. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupVaultName: z.string().describe('The name of the backup vault'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of recovery points to return'),
    byResourceArn: z.string().optional().describe('Filter by resource ARN'),
    byResourceType: z.string().optional().describe('Filter by resource type'),
    byBackupPlanId: z.string().optional().describe('Filter by backup plan ID'),
    byCreatedBefore: z.string().optional().describe('Filter by created before date'),
    byCreatedAfter: z.string().optional().describe('Filter by created after date'),
  }),
  execute: async ({ awsCredentials, region, backupVaultName, nextToken, maxResults, byResourceArn, byResourceType, byBackupPlanId, byCreatedBefore, byCreatedAfter }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new ListRecoveryPointsByBackupVaultCommand({
          BackupVaultName: backupVaultName,
          NextToken: nextToken,
          MaxResults: maxResults,
          ByResourceArn: byResourceArn,
          ByResourceType: byResourceType,
          ByBackupPlanId: byBackupPlanId,
          ByCreatedBefore: byCreatedBefore ? new Date(byCreatedBefore) : undefined,
          ByCreatedAfter: byCreatedAfter ? new Date(byCreatedAfter) : undefined,
      });
      const response = await client.send(command);
      return {
                  recoveryPoints: response.RecoveryPoints || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list recovery points in a backup vault', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
