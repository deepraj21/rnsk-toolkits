import { tool } from 'ai';
import { z } from 'zod';
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDbDocClient } from '../client.js';

export const awsDynamodbBatchWriteItem = tool({
  description: 'Write or delete up to 25 items across one or more DynamoDB tables.. Use it to write data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    requestItems: z.record(z.any()).describe('Tables and operations (e.g., {"TableName": [{"PutRequest": {"Item": {...}}}]})'),
  }),
  execute: async ({ awsCredentials, region, requestItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbDocClient(awsCredentials, region);

      const command = new BatchWriteCommand({
          RequestItems: requestItems,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to write or delete up to 25 items across one or more DynamoDB tables', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
