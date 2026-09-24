import { tool } from 'ai';
import { z } from 'zod';
import { GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetCostAndUsage = tool({
  description: 'Retrieves cost and usage metrics for your account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    timePeriod: z.record(z.any()).describe('Start date in YYYY-MM-DD format'),
    granularity: z.enum(['DAILY', 'MONTHLY', 'HOURLY']).optional().describe('The granularity of the data'),
    metrics: z.array(z.string()).optional().describe('The metrics to retrieve (e.g., BlendedCost, UnblendedCost)'),
    filter: z.record(z.any()).optional().describe('Filters to apply to the data'),
    groupBy: z.array(z.record(z.any())).optional().describe('Group results by dimension'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, timePeriod, granularity, metrics, filter, groupBy, nextPageToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetCostAndUsageCommand({
          TimePeriod: timePeriod ? {
              Start: timePeriod.start,
              End: timePeriod.end,
          } : undefined,
          Granularity: granularity,
          Metrics: metrics,
          Filter: filter,
          GroupBy: groupBy,
          NextPageToken: nextPageToken,
      });
      const response = await client.send(command);
      return {
                  resultsByTime: response.ResultsByTime || [],
                  dimensionValueAttributes: response.DimensionValueAttributes || [],
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves cost and usage metrics for your account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
