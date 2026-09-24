import { tool } from 'ai';
import { z } from 'zod';
import { DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsDeleteDynamodbTable = tool({
  description: 'Delete a DynamoDB table.. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table to delete'),
  }),
  execute: async ({ awsCredentials, region, tableName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new DeleteTableCommand({
          TableName: tableName,
      });
      const response = await client.send(command);
      return response.TableDescription;
    } catch (err) {
      return { error: 'Failed to delete a DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
