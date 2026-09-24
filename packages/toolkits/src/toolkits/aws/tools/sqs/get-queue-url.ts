import { tool } from 'ai';
import { z } from 'zod';
import { GetQueueUrlCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsGetSqsQueueUrl = tool({
  description: 'Get the URL of an SQS queue. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueName: z.string().describe('The name of the queue'),
    queueOwnerAWSAccountId: z.string().optional().describe('The AWS account ID of the queue owner'),
  }),
  execute: async ({ awsCredentials, region, queueName, queueOwnerAWSAccountId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new GetQueueUrlCommand({
          QueueName: queueName,
          QueueOwnerAWSAccountId: queueOwnerAWSAccountId,
      });
      const response = await client.send(command);
      return {
                  queueUrl: response.QueueUrl,
              };
    } catch (err) {
      return { error: 'Failed to get the URL of an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
