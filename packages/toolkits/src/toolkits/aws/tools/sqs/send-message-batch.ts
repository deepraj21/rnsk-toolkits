import { tool } from 'ai';
import { z } from 'zod';
import { SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsSendSqsMessageBatch = tool({
  description: 'Send multiple messages to an SQS queue in a batch. Use it to send a message.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    entries: z.array(z.record(z.any())).describe('Array of messages to send (up to 10)'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, entries }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new SendMessageBatchCommand({
          QueueUrl: queueUrl,
          Entries: entries as any,
      });
      const response = await client.send(command);
      return {
                  successful: response.Successful || [],
                  failed: response.Failed || [],
              };
    } catch (err) {
      return { error: 'Failed to send multiple messages to an SQS queue in a batch', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
