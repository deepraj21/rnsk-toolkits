import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsUntagDynamodbResource = tool({
  description: 'Remove tags from a DynamoDB table. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('ARN of the table'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          ResourceArn: resourceArn,
          TagKeys: tagKeys,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to remove tags from a DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
