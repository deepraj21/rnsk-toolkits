import { tool } from 'ai';
import { z } from 'zod';
import { GetAnomalySubscriptionsCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetAnomalySubscriptions = tool({
  description: 'Retrieves the cost anomaly subscription objects for your account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    subscriptionArnList: z.array(z.string()).optional().describe('List of subscription ARNs'),
    monitorArn: z.string().optional().describe('The ARN of the cost anomaly monitor'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, subscriptionArnList, monitorArn, nextPageToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetAnomalySubscriptionsCommand({
          SubscriptionArnList: subscriptionArnList,
          MonitorArn: monitorArn,
          NextPageToken: nextPageToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  anomalySubscriptions: response.AnomalySubscriptions || [],
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves the cost anomaly subscription objects for your account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
