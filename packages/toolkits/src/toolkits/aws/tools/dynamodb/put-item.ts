import { tool } from 'ai';
import { z } from 'zod';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDbDocClient } from '../client.js';

export const awsDynamodbPutItem = tool({
  description: 'Create or replace an item in DynamoDB table.. Use it to write data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    item: z.record(z.any()).describe('Item to put (includes all attributes)'),
  }),
  execute: async ({ awsCredentials, region, tableName, item }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbDocClient(awsCredentials, region);

      const command = new PutCommand({
          TableName: tableName,
          Item: item,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create or replace an item in DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
