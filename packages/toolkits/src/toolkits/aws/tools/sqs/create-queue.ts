import { tool } from 'ai';
import { z } from 'zod';
import { CreateQueueCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsCreateSqsQueue = tool({
  description: 'Create a new SQS queue. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueName: z.string().describe('The name of the queue'),
    attributes: z.record(z.any()).optional().describe('Queue attributes (DelaySeconds, MaximumMessageSize, MessageRetentionPeriod, Policy, ReceiveMessageWaitTimeSeconds, RedrivePolicy, VisibilityTimeout, etc.)'),
    tags: z.record(z.any()).optional().describe('Tags to apply to the queue'),
  }),
  execute: async ({ awsCredentials, region, queueName, attributes, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new CreateQueueCommand({
          QueueName: queueName,
          Attributes: attributes,
          tags: tags,
      });
      const response = await client.send(command);
      return {
                  queueUrl: response.QueueUrl,
              };
    } catch (err) {
      return { error: 'Failed to create a new SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
