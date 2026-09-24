import { tool } from 'ai';
import { z } from 'zod';
import { ConfirmSubscriptionCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsConfirmSnsSubscription = tool({
  description: 'Confirm an SNS subscription (for HTTP/HTTPS). Use it to confirm a pending subscription.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().describe('The ARN of the topic'),
    token: z.string().describe('The confirmation token'),
    authenticateOnUnsubscribe: z.boolean().optional().describe('Whether to authenticate on unsubscribe'),
  }),
  execute: async ({ awsCredentials, region, topicArn, token, authenticateOnUnsubscribe }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new ConfirmSubscriptionCommand({
          TopicArn: topicArn,
          Token: token,
          AuthenticateOnUnsubscribe: authenticateOnUnsubscribe !== undefined ? String(authenticateOnUnsubscribe) : undefined,
      });
      const response = await client.send(command);
      return {
                  subscriptionArn: response.SubscriptionArn,
              };
    } catch (err) {
      return { error: 'Failed to confirm an SNS subscription (for HTTP/HTTPS)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
