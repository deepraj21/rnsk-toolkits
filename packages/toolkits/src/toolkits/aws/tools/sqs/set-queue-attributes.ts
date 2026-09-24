import { tool } from 'ai';
import { z } from 'zod';
import { SetQueueAttributesCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsSetSqsQueueAttributes = tool({
  description: 'Set attributes of an SQS queue. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    attributes: z.record(z.any()).describe('Queue attributes to set'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, attributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new SetQueueAttributesCommand({
          QueueUrl: queueUrl,
          Attributes: attributes,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Attributes set successfully for queue ${queueUrl}`,
              };
    } catch (err) {
      return { error: 'Failed to set attributes of an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
