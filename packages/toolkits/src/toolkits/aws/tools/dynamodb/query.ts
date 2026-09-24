import { tool } from 'ai';
import { z } from 'zod';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDbDocClient } from '../client.js';

export const awsDynamodbQuery = tool({
  description: 'Query DynamoDB table by partition key with optional sort key conditions.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    keyConditionExpression: z.string().describe('Key condition (e.g., "pk = :pk AND sk > :sk")'),
    expressionAttributeNames: z.record(z.any()).optional().describe('Attribute name mappings'),
    expressionAttributeValues: z.record(z.any()).optional().describe('Attribute value mappings'),
    filterExpression: z.string().optional().describe('Filter expression for non-key attributes'),
    limit: z.number().optional().describe('Maximum number of items to return'),
    scanIndexForward: z.boolean().optional().describe('Sort order (true = ascending, false = descending)'),
    indexName: z.string().optional().describe('GSI or LSI name (optional)'),
  }),
  execute: async ({ awsCredentials, region, tableName, keyConditionExpression, expressionAttributeNames, expressionAttributeValues, filterExpression, limit, scanIndexForward, indexName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbDocClient(awsCredentials, region);

      const command = new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: keyConditionExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          FilterExpression: filterExpression,
          Limit: limit,
          ScanIndexForward: scanIndexForward,
          IndexName: indexName,
      });
      const response = await client.send(command);
      return response.Items;
    } catch (err) {
      return { error: 'Failed to query DynamoDB table by partition key with optional sort key conditions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
