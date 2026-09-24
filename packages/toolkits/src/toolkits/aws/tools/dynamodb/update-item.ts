import { tool } from 'ai';
import { z } from 'zod';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createDynamoDbDocClient } from '../client.js';

export const awsDynamodbUpdateItem = tool({
  description: 'Update specific attributes of an item in DynamoDB.. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    key: z.record(z.any()).describe('Primary key of the item'),
    updateExpression: z.string().describe('Update expression (e.g., "SET #name = :val")'),
    expressionAttributeNames: z.record(z.any()).optional().describe('Attribute name mappings (e.g., {"#name": "userName"})'),
    expressionAttributeValues: z.record(z.any()).optional().describe('Attribute value mappings (e.g., {":val": "John"})'),
  }),
  execute: async ({ awsCredentials, region, tableName, key, updateExpression, expressionAttributeNames, expressionAttributeValues }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbDocClient(awsCredentials, region);

      const command = new UpdateCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
      });
      const response = await client.send(command);
      return response.Attributes;
    } catch (err) {
      return { error: 'Failed to update specific attributes of an item in DynamoDB', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
