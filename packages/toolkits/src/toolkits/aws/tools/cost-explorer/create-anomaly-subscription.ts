import { tool } from 'ai';
import { z } from 'zod';
import { CreateAnomalySubscriptionCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsCreateAnomalySubscription = tool({
  description: 'Creates a new cost anomaly subscription. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    monitorArnList: z.array(z.string()).describe('List of monitor ARNs'),
    subscribers: z.enum(['EMAIL', 'SNS']).describe('List of subscribers'),
    subscriptionName: z.string().describe('The name of the subscription'),
    threshold: z.number().optional().describe('The threshold value'),
    frequency: z.enum(['DAILY', 'IMMEDIATE', 'WEEKLY']).optional().describe('The frequency of the subscription'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the subscription'),
  }),
  execute: async ({ awsCredentials, region, monitorArnList, subscribers, subscriptionName, threshold, frequency, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new CreateAnomalySubscriptionCommand({
          AnomalySubscription: {
              MonitorArnList: monitorArnList,
              Subscribers: subscribers,
              SubscriptionName: subscriptionName,
              Threshold: threshold,
              Frequency: frequency,
          },
          ResourceTags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  subscriptionArn: response.SubscriptionArn,
              };
    } catch (err) {
      return { error: 'Failed to creates a new cost anomaly subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
