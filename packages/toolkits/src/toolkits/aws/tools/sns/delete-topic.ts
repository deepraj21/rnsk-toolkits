import { tool } from 'ai';
import { z } from 'zod';
import { DeleteTopicCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsDeleteSnsTopic = tool({
  description: 'Delete an SNS topic.. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().describe('The ARN of the topic to delete'),
  }),
  execute: async ({ awsCredentials, region, topicArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new DeleteTopicCommand({
          TopicArn: topicArn,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Topic ${topicArn} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete an SNS topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
