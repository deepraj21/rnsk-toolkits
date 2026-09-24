import { tool } from 'ai';
import { z } from 'zod';
import { GetTopicAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsGetSnsTopicAttributes = tool({
  description: 'Get attributes of an SNS topic.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().describe('The ARN of the topic'),
  }),
  execute: async ({ awsCredentials, region, topicArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new GetTopicAttributesCommand({
          TopicArn: topicArn,
      });
      const response = await client.send(command);
      return {
                  attributes: response.Attributes || {},
              };
    } catch (err) {
      return { error: 'Failed to get attributes of an SNS topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
