import { tool } from 'ai';
import { z } from 'zod';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDbDocClient } from '../client.js';

export const awsDynamodbDeleteItem = tool({
  description: 'Delete an item from DynamoDB table.. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    key: z.record(z.any()).describe('Primary key of the item to delete'),
  }),
  execute: async ({ awsCredentials, region, tableName, key }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbDocClient(awsCredentials, region);

      const command = new DeleteCommand({
          TableName: tableName,
          Key: key,
          ReturnValues: 'ALL_OLD',
      });
      const response = await client.send(command);
      return response.Attributes;
    } catch (err) {
      return { error: 'Failed to delete an item from DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
