import { tool } from 'ai';
import { z } from 'zod';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDbDocClient } from '../client.js';

export const awsDynamodbGetItem = tool({
  description: 'Retrieve a single item from DynamoDB table by primary key.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    key: z.record(z.any()).describe('Primary key of the item (e.g., {"id": "123"})'),
    consistentRead: z.boolean().optional().describe('Use strongly consistent read'),
  }),
  execute: async ({ awsCredentials, region, tableName, key, consistentRead }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbDocClient(awsCredentials, region);

      const command = new GetCommand({
          TableName: tableName,
          Key: key,
          ConsistentRead: consistentRead,
      });
      const response = await client.send(command);
      return response.Item;
    } catch (err) {
      return { error: 'Failed to retrieve a single item from DynamoDB table by primary key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
