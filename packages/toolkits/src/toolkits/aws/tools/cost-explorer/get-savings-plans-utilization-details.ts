import { tool } from 'ai';
import { z } from 'zod';
import { GetSavingsPlansUtilizationDetailsCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetSavingsPlansUtilizationDetails = tool({
  description: 'Retrieves attribute data about Savings Plans utilization. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    timePeriod: z.record(z.any()).describe('Start date in YYYY-MM-DD format'),
    filter: z.record(z.any()).optional().describe('Filters to apply to the data'),
    dataType: z.array(z.string()).optional().describe('The data type'),
    sortBy: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('Sort results'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, timePeriod, filter, dataType, sortBy, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetSavingsPlansUtilizationDetailsCommand({
          TimePeriod: timePeriod ? {
              Start: timePeriod.start,
              End: timePeriod.end,
          } : undefined,
          Filter: filter,
          DataType: dataType,
          SortBy: sortBy,
          NextToken: nextToken,
          MaxResults: maxResults,
      } as any);
      const response = await client.send(command);
      return {
                  savingsPlansUtilizationDetails: response.SavingsPlansUtilizationDetails || [],
                  total: response.Total,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves attribute data about Savings Plans utilization', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
