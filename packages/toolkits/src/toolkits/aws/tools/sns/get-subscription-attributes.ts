import { tool } from 'ai';
import { z } from 'zod';
import { GetSubscriptionAttributesCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsGetSnsSubscriptionAttributes = tool({
  description: 'Get attributes of an SNS subscription. Use it to inspect current state before making changes.',
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

      const command = new GetSubscriptionAttributesCommand({
          SubscriptionArn: subscriptionArn,
      });
      const response = await client.send(command);
      return {
                  attributes: response.Attributes || {},
              };
    } catch (err) {
      return { error: 'Failed to get attributes of an SNS subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
