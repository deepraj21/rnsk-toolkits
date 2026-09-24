import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsDescribeDynamodbTable = tool({
  description: 'Get detailed information about a DynamoDB table including schema, status, and metrics.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
  }),
  execute: async ({ awsCredentials, region, tableName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new DescribeTableCommand({
          TableName: tableName,
      });
      const response = await client.send(command);
      return response.Table;
    } catch (err) {
      return { error: 'Failed to get detailed information about a DynamoDB table including schema, status, and metrics', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
