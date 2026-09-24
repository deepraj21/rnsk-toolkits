import { tool } from 'ai';
import { z } from 'zod';
import { UntagQueueCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsUntagSqsQueue = tool({
  description: 'Remove tags from an SQS queue',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    tagKeys: z.array(z.string()).describe('List of tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new UntagQueueCommand({
          QueueUrl: queueUrl,
          TagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags removed successfully from queue ${queueUrl}`,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
