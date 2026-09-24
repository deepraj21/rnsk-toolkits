import { tool } from 'ai';
import { z } from 'zod';
import { ListBackupsCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsListDynamodbBackups = tool({
  description: 'List on-demand backups for DynamoDB tables. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().optional().describe('Filter by table name'),
    limit: z.number().optional().describe('Maximum number of backups to return'),
  }),
  execute: async ({ awsCredentials, region, tableName, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new ListBackupsCommand({
          TableName: tableName,
          Limit: limit,
      });
      const response = await client.send(command);
      return response.BackupSummaries;
    } catch (err) {
      return { error: 'Failed to list on-demand backups for DynamoDB tables', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
