import { tool } from 'ai';
import { z } from 'zod';
import { DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsDeleteSqsMessage = tool({
  description: 'Delete a message from an SQS queue. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    receiptHandle: z.string().describe('The receipt handle of the message'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, receiptHandle }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: receiptHandle,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Message deleted successfully from queue ${queueUrl}`,
              };
    } catch (err) {
      return { error: 'Failed to delete a message from an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
