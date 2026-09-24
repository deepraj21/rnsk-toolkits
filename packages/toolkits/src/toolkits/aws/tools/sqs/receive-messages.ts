import { tool } from 'ai';
import { z } from 'zod';
import { ReceiveMessageCommand, QueueAttributeName } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsReceiveSqsMessages = tool({
  description: 'Receive messages from an SQS queue. Use it to poll for new messages.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    maxNumberOfMessages: z.number().optional().describe('Maximum number of messages to receive (1-10)'),
    visibilityTimeout: z.number().optional().describe('Visibility timeout in seconds'),
    waitTimeSeconds: z.number().optional().describe('Long polling wait time in seconds (0-20)'),
    messageAttributeNames: z.array(z.string()).optional().describe('Message attribute names to retrieve'),
    attributeNames: z.array(z.string()).optional().describe('Queue attribute names to retrieve'),
    receiveRequestAttemptId: z.string().optional().describe('Request attempt ID (for FIFO queues)'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, maxNumberOfMessages, visibilityTimeout, waitTimeSeconds, messageAttributeNames, attributeNames, receiveRequestAttemptId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: maxNumberOfMessages,
          VisibilityTimeout: visibilityTimeout,
          WaitTimeSeconds: waitTimeSeconds,
          MessageAttributeNames: messageAttributeNames,
          AttributeNames: attributeNames as QueueAttributeName[] | undefined,
          ReceiveRequestAttemptId: receiveRequestAttemptId,
      });
      const response = await client.send(command);
      return {
                  messages: response.Messages || [],
              };
    } catch (err) {
      return { error: 'Failed to receive messages from an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
