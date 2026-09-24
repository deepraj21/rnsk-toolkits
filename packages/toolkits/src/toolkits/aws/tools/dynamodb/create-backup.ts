import { tool } from 'ai';
import { z } from 'zod';
import { CreateBackupCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsCreateDynamodbBackup = tool({
  description: 'Create an on-demand backup of a DynamoDB table. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table to backup'),
    backupName: z.string().describe('Name for the backup'),
  }),
  execute: async ({ awsCredentials, region, tableName, backupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new CreateBackupCommand({
          TableName: tableName,
          BackupName: backupName,
      });
      const response = await client.send(command);
      return response.BackupDetails;
    } catch (err) {
      return { error: 'Failed to create an on-demand backup of a DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
