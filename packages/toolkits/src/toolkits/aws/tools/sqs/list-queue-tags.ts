import { tool } from 'ai';
import { z } from 'zod';
import { ListQueueTagsCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsListSqsQueueTags = tool({
  description: 'List tags for an SQS queue. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
  }),
  execute: async ({ awsCredentials, region, queueUrl }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new ListQueueTagsCommand({
          QueueUrl: queueUrl,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || {},
              };
    } catch (err) {
      return { error: 'Failed to list tags for an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
