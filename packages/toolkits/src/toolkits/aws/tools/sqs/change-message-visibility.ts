import { tool } from 'ai';
import { z } from 'zod';
import { ChangeMessageVisibilityCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsChangeSqsMessageVisibility = tool({
  description: 'Change the visibility timeout of a message. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    receiptHandle: z.string().describe('The receipt handle of the message'),
    visibilityTimeout: z.number().describe('New visibility timeout in seconds'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, receiptHandle, visibilityTimeout }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new ChangeMessageVisibilityCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: receiptHandle,
          VisibilityTimeout: visibilityTimeout,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Message visibility timeout changed successfully`,
              };
    } catch (err) {
      return { error: 'Failed to change the visibility timeout of a message', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
