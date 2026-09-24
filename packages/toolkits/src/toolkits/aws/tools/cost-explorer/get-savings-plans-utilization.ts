import { tool } from 'ai';
import { z } from 'zod';
import { GetSavingsPlansUtilizationCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetSavingsPlansUtilization = tool({
  description: 'Retrieves the Savings Plans utilization for your account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    timePeriod: z.record(z.any()).describe('Start date in YYYY-MM-DD format'),
    granularity: z.enum(['DAILY', 'MONTHLY']).optional().describe('The granularity of the data'),
    filter: z.record(z.any()).optional().describe('Filters to apply to the data'),
    sortBy: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('Sort results'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, timePeriod, granularity, filter, sortBy, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetSavingsPlansUtilizationCommand({
          TimePeriod: timePeriod ? {
              Start: timePeriod.start,
              End: timePeriod.end,
          } : undefined,
          Granularity: granularity,
          Filter: filter,
          SortBy: sortBy,
      } as any);
      const response = await client.send(command);
      return {
                  savingsPlansUtilizationsByTime: response.SavingsPlansUtilizationsByTime || [],
                  total: response.Total,
              };
    } catch (err) {
      return { error: 'Failed to retrieves the Savings Plans utilization for your account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
