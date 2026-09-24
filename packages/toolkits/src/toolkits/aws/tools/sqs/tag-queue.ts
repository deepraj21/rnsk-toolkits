import { tool } from 'ai';
import { z } from 'zod';
import { TagQueueCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsTagSqsQueue = tool({
  description: 'Add tags to an SQS queue. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    tags: z.record(z.any()).describe('Tags to apply (key-value pairs)'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new TagQueueCommand({
          QueueUrl: queueUrl,
          Tags: tags,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags added successfully to queue ${queueUrl}`,
              };
    } catch (err) {
      return { error: 'Failed to add tags to an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
