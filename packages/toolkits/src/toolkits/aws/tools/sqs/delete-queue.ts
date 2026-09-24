import { tool } from 'ai';
import { z } from 'zod';
import { DeleteQueueCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsDeleteSqsQueue = tool({
  description: 'Delete an SQS queue. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue to delete'),
  }),
  execute: async ({ awsCredentials, region, queueUrl }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new DeleteQueueCommand({
          QueueUrl: queueUrl,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Queue ${queueUrl} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
