import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTimeToLiveCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsDescribeTimeToLive = tool({
  description: 'Get Time To Live (TTL) configuration for a DynamoDB table. Use it to inspect current state before making changes.',
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

      const command = new DescribeTimeToLiveCommand({
          TableName: tableName,
      });
      const response = await client.send(command);
      return response.TimeToLiveDescription;
    } catch (err) {
      return { error: 'Failed to get Time To Live (TTL) configuration for a DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
