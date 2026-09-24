import { tool } from 'ai';
import { z } from 'zod';
import { DescribeGlobalTableCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsDescribeGlobalTable = tool({
  description: 'Get details about a DynamoDB Global Table. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalTableName: z.string().describe('Name of the global table'),
  }),
  execute: async ({ awsCredentials, region, globalTableName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new DescribeGlobalTableCommand({
          GlobalTableName: globalTableName,
      });
      const response = await client.send(command);
      return response.GlobalTableDescription;
    } catch (err) {
      return { error: 'Failed to get details about a DynamoDB Global Table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
