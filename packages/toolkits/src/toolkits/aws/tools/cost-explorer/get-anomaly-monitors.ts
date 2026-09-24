import { tool } from 'ai';
import { z } from 'zod';
import { GetAnomalyMonitorsCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetAnomalyMonitors = tool({
  description: 'Retrieves the cost anomaly monitor objects for your account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    monitorArnList: z.array(z.string()).optional().describe('List of monitor ARNs'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, monitorArnList, nextPageToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetAnomalyMonitorsCommand({
          MonitorArnList: monitorArnList,
          NextPageToken: nextPageToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  anomalyMonitors: response.AnomalyMonitors || [],
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves the cost anomaly monitor objects for your account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
