import { tool } from 'ai';
import { z } from 'zod';
import { GetQueueAttributesCommand, QueueAttributeName } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsGetSqsQueueAttributes = tool({
  description: 'Get attributes of an SQS queue. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    attributeNames: z.array(z.string()).optional().describe('List of attribute names to retrieve (All, Policy, VisibilityTimeout, MaximumMessageSize, MessageRetentionPeriod, ApproximateNumberOfMessages, etc.)'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, attributeNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new GetQueueAttributesCommand({
          QueueUrl: queueUrl,
          AttributeNames: attributeNames as QueueAttributeName[] | undefined,
      });
      const response = await client.send(command);
      return {
                  attributes: response.Attributes || {},
              };
    } catch (err) {
      return { error: 'Failed to get attributes of an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
