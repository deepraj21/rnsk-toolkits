import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAnomalySubscriptionCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsDeleteAnomalySubscription = tool({
  description: 'Deletes a cost anomaly subscription. Use it to permanently remove the resource.',
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
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new DeleteAnomalySubscriptionCommand({
          SubscriptionArn: subscriptionArn,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes a cost anomaly subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
