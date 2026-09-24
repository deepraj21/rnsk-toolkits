import { tool } from 'ai';
import { z } from 'zod';
import { GetTagsCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetTags = tool({
  description: 'Queries for available tag keys and tag values for a specified period. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    searchString: z.string().optional().describe('Search string to filter results'),
    timePeriod: z.record(z.any()).describe('Start date in YYYY-MM-DD format'),
    tagKey: z.string().optional().describe('The key of the tag'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, searchString, timePeriod, tagKey, nextPageToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetTagsCommand({
          SearchString: searchString,
          TimePeriod: timePeriod ? {
              Start: timePeriod.start,
              End: timePeriod.end,
          } : undefined,
          TagKey: tagKey,
          NextPageToken: nextPageToken,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags || [],
                  returnSize: response.ReturnSize,
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to queries for available tag keys and tag values for a specified period', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
