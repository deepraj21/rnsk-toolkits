import { tool } from 'ai';
import { z } from 'zod';
import { GetCostCategoriesCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetCostCategories = tool({
  description: 'Retrieves cost category values for a specific time period. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    timePeriod: z.record(z.any()).describe('Start date in YYYY-MM-DD format'),
    costCategoryName: z.string().optional().describe('The name of the cost category'),
    filter: z.record(z.any()).optional().describe('Filters to apply to the data'),
    sortBy: z.enum(['ASCENDING', 'DESCENDING']).optional().describe('Sort results'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
    searchString: z.string().optional().describe('Search string to filter results'),
  }),
  execute: async ({ awsCredentials, region, timePeriod, costCategoryName, filter, sortBy, maxResults, nextPageToken, searchString }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetCostCategoriesCommand({
          TimePeriod: timePeriod ? {
              Start: timePeriod.start,
              End: timePeriod.end,
          } : undefined,
          CostCategoryName: costCategoryName,
          Filter: filter,
          SortBy: sortBy,
          MaxResults: maxResults,
          NextPageToken: nextPageToken,
          SearchString: searchString,
      } as any);
      const response = await client.send(command);
      return {
                  returnSize: response.ReturnSize,
                  costCategoryNames: response.CostCategoryNames || [],
                  costCategoryValues: response.CostCategoryValues || [],
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves cost category values for a specific time period', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
