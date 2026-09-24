import { tool } from 'ai';
import { z } from 'zod';
import { UnsubscribeCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsUnsubscribeSnsTopic = tool({
  description: 'Unsubscribe from an SNS topic.. Use it to remove a subscription.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    subscriptionArn: z.string().describe('The ARN of the subscription'),
  }),
  execute: async ({ awsCredentials, region, subscriptionArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new UnsubscribeCommand({
          SubscriptionArn: subscriptionArn,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Unsubscribed from ${subscriptionArn} successfully`,
              };
    } catch (err) {
      return { error: 'Failed to unsubscribe from an SNS topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
