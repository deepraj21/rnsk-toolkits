import { tool } from 'ai';
import { z } from 'zod';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDbDocClient } from '../client.js';

export const awsDynamodbScan = tool({
  description: 'Scan entire DynamoDB table (use with caution on large tables).. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    filterExpression: z.string().optional().describe('Filter expression'),
    expressionAttributeNames: z.record(z.any()).optional().describe('Attribute name mappings'),
    expressionAttributeValues: z.record(z.any()).optional().describe('Attribute value mappings'),
    limit: z.number().optional().describe('Maximum number of items to return'),
  }),
  execute: async ({ awsCredentials, region, tableName, filterExpression, expressionAttributeNames, expressionAttributeValues, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbDocClient(awsCredentials, region);

      const command = new ScanCommand({
          TableName: tableName,
          FilterExpression: filterExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          Limit: limit,
      });
      const response = await client.send(command);
      return response.Items;
    } catch (err) {
      return { error: 'Failed to scan entire DynamoDB table (use with caution on large tables)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
