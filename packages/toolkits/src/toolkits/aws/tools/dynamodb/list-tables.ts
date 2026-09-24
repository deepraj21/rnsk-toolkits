import { tool } from 'ai';
import { z } from 'zod';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsListDynamodbTables = tool({
  description: 'List all DynamoDB tables in the region.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    exclusiveStartTableName: z.string().optional().describe('Pagination token from previous response'),
    limit: z.number().optional().describe('Maximum number of tables to return (1-100)'),
  }),
  execute: async ({ awsCredentials, region, exclusiveStartTableName, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new ListTablesCommand({
          ExclusiveStartTableName: exclusiveStartTableName,
          Limit: limit,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all DynamoDB tables in the region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
