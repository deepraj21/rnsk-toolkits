import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAnomalySubscriptionCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsUpdateAnomalySubscription = tool({
  description: 'Updates an existing cost anomaly subscription. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    subscriptionArn: z.string().describe('The ARN of the subscription'),
    monitorArnList: z.array(z.string()).optional().describe('List of monitor ARNs'),
    subscribers: z.enum(['EMAIL', 'SNS']).optional().describe('List of subscribers'),
    subscriptionName: z.string().optional().describe('The name of the subscription'),
    threshold: z.number().optional().describe('The threshold value'),
    frequency: z.enum(['DAILY', 'IMMEDIATE', 'WEEKLY']).optional().describe('The frequency of the subscription'),
  }),
  execute: async ({ awsCredentials, region, subscriptionArn, monitorArnList, subscribers, subscriptionName, threshold, frequency }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new UpdateAnomalySubscriptionCommand({
          SubscriptionArn: subscriptionArn,
          MonitorArnList: monitorArnList,
          Subscribers: subscribers,
          SubscriptionName: subscriptionName,
          Threshold: threshold,
          Frequency: frequency,
      } as any);
      const response = await client.send(command);
      return {
                  subscriptionArn: response.SubscriptionArn,
              };
    } catch (err) {
      return { error: 'Failed to updates an existing cost anomaly subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
