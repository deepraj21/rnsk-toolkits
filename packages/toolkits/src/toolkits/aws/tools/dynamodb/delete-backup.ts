import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBackupCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsDeleteDynamodbBackup = tool({
  description: 'Delete an on-demand DynamoDB backup. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupArn: z.string().describe('ARN of the backup to delete'),
  }),
  execute: async ({ awsCredentials, region, backupArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new DeleteBackupCommand({
          BackupArn: backupArn,
      });
      const response = await client.send(command);
      return response.BackupDescription;
    } catch (err) {
      return { error: 'Failed to delete an on-demand DynamoDB backup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
