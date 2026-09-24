import { tool } from 'ai';
import { z } from 'zod';
import { ListSubscriptionsByTopicCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsListSnsSubscriptionsByTopic = tool({
  description: 'List subscriptions for a specific topic.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().describe('The ARN of the topic'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, topicArn, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new ListSubscriptionsByTopicCommand({
          TopicArn: topicArn,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  subscriptions: response.Subscriptions || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list subscriptions for a specific topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
