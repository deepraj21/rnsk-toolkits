import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDbDocClient } from '../client.js';

export const awsDynamodbBatchGetItem = tool({
  description: 'Retrieve up to 100 items from one or more DynamoDB tables.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    requestItems: z.record(z.any()).describe('Tables and keys to retrieve (e.g., {"TableName": {"Keys": [{"id": "1"}]}})'),
  }),
  execute: async ({ awsCredentials, region, requestItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbDocClient(awsCredentials, region);

      const command = new BatchGetCommand({
          RequestItems: requestItems,
      });
      const response = await client.send(command);
      return response.Responses;
    } catch (err) {
      return { error: 'Failed to retrieve up to 100 items from one or more DynamoDB tables', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
