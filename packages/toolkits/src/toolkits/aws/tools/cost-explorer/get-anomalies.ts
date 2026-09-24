import { tool } from 'ai';
import { z } from 'zod';
import { GetAnomaliesCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetAnomalies = tool({
  description: 'Retrieves all of the cost anomalies detected on your account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dateInterval: z.record(z.any()).optional().describe('Start date in YYYY-MM-DD format'),
    monitorArn: z.string().optional().describe('The ARN of the cost anomaly monitor'),
    feedback: z.enum(['YES', 'NO']).optional().describe('The feedback value'),
    totalImpact: z.record(z.any()).optional().describe('The total impact filter'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, dateInterval, monitorArn, feedback, totalImpact, nextPageToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetAnomaliesCommand({
          DateInterval: dateInterval ? {
              StartDate: dateInterval.start,
              EndDate: dateInterval.end,
          } : undefined,
          MonitorArn: monitorArn,
          Feedback: feedback,
          TotalImpact: totalImpact,
          NextPageToken: nextPageToken,
          MaxResults: maxResults,
      } as any);
      const response = await client.send(command);
      return {
                  anomalies: response.Anomalies || [],
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves all of the cost anomalies detected on your account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
