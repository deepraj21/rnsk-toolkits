import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsTagDynamodbResource = tool({
  description: 'Add tags to a DynamoDB table. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('ARN of the table'),
    tags: z.array(z.record(z.any())).describe('Tags to add'),
    properties: z.string().optional().describe('properties'),
    Key: z.string().optional().describe('Key'),
    Value: z.string().optional().describe('Value'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tags, properties, Key, Value }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new TagResourceCommand({
          ResourceArn: resourceArn,
          Tags: tags as any,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to add tags to a DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
