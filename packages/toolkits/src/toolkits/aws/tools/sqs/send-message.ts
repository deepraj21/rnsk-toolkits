import { tool } from 'ai';
import { z } from 'zod';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsSendSqsMessage = tool({
  description: 'Send a message to an SQS queue. Use it to send a message.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    messageBody: z.string().describe('The message body'),
    delaySeconds: z.number().optional().describe('Delay in seconds before the message becomes available'),
    messageAttributes: z.record(z.any()).optional().describe('Message attributes'),
    messageSystemAttributes: z.record(z.any()).optional().describe('Message system attributes'),
    messageDeduplicationId: z.string().optional().describe('Deduplication ID (for FIFO queues)'),
    messageGroupId: z.string().optional().describe('Message group ID (for FIFO queues)'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, messageBody, delaySeconds, messageAttributes, messageSystemAttributes, messageDeduplicationId, messageGroupId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: messageBody,
          DelaySeconds: delaySeconds,
          MessageAttributes: messageAttributes,
          MessageSystemAttributes: messageSystemAttributes,
          MessageDeduplicationId: messageDeduplicationId,
          MessageGroupId: messageGroupId,
      });
      const response = await client.send(command);
      return {
                  messageId: response.MessageId,
                  sequenceNumber: response.SequenceNumber,
                  mD5OfMessageBody: response.MD5OfMessageBody,
                  mD5OfMessageAttributes: response.MD5OfMessageAttributes,
              };
    } catch (err) {
      return { error: 'Failed to send a message to an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
