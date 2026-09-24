import { tool } from 'ai';
import { z } from 'zod';
import { PublishBatchCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsPublishSnsBatch = tool({
  description: 'Publish multiple messages to an SNS topic in a batch. Use it to publish or release.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().describe('The ARN of the topic'),
    publishBatchRequestEntries: z.array(z.record(z.any())).describe('Array of messages to publish'),
  }),
  execute: async ({ awsCredentials, region, topicArn, publishBatchRequestEntries }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new PublishBatchCommand({
          TopicArn: topicArn,
          PublishBatchRequestEntries: publishBatchRequestEntries as any,
      });
      const response = await client.send(command);
      return {
                  successful: response.Successful || [],
                  failed: response.Failed || [],
              };
    } catch (err) {
      return { error: 'Failed to publish multiple messages to an SNS topic in a batch', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
