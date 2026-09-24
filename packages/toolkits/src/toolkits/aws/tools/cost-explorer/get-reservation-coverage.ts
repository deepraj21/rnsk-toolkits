import { tool } from 'ai';
import { z } from 'zod';
import { GetReservationCoverageCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetReservationCoverage = tool({
  description: 'Retrieves the reservation coverage for your account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    timePeriod: z.record(z.any()).describe('Start date in YYYY-MM-DD format'),
    groupBy: z.array(z.record(z.any())).optional().describe('Group results by dimension'),
    granularity: z.enum(['DAILY', 'MONTHLY']).optional().describe('The granularity of the data'),
    filter: z.record(z.any()).optional().describe('Filters to apply to the data'),
    metrics: z.array(z.string()).optional().describe('The metrics to retrieve'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, timePeriod, groupBy, granularity, filter, metrics, nextPageToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetReservationCoverageCommand({
          TimePeriod: timePeriod ? {
              Start: timePeriod.start,
              End: timePeriod.end,
          } : undefined,
          GroupBy: groupBy,
          Granularity: granularity,
          Filter: filter,
          Metrics: metrics,
          NextPageToken: nextPageToken,
      });
      const response = await client.send(command);
      return {
                  coveragesByTime: response.CoveragesByTime || [],
                  total: response.Total,
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves the reservation coverage for your account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
