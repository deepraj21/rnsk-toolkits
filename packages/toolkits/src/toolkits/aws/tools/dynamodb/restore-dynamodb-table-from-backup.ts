import { tool } from 'ai';
import { z } from 'zod';
import { RestoreTableFromBackupCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsRestoreDynamodbTableFromBackup = tool({
  description: 'Restore a DynamoDB table from a backup. Use it to restore from a backup.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    targetTableName: z.string().describe('Name for the restored table'),
    backupArn: z.string().describe('ARN of the backup to restore from'),
  }),
  execute: async ({ awsCredentials, region, targetTableName, backupArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new RestoreTableFromBackupCommand({
          TargetTableName: targetTableName,
          BackupArn: backupArn,
      });
      const response = await client.send(command);
      return response.TableDescription;
    } catch (err) {
      return { error: 'Failed to restore a DynamoDB table from a backup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
