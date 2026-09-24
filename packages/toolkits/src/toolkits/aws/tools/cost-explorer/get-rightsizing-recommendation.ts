import { tool } from 'ai';
import { z } from 'zod';
import { GetRightsizingRecommendationCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetRightsizingRecommendation = tool({
  description: 'Creates recommendations that help you reduce cost and improve efficiency. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filter: z.record(z.any()).optional().describe('Filters to apply to the data'),
    service: z.string().optional().describe('The specific service that you want recommendations for'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
    pageSize: z.number().optional().describe('The number of recommendations to return'),
  }),
  execute: async ({ awsCredentials, region, filter, service, nextPageToken, pageSize }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetRightsizingRecommendationCommand({
          Filter: filter,
          Service: service,
          NextPageToken: nextPageToken,
          PageSize: pageSize,
      });
      const response = await client.send(command);
      return {
                  metadata: response.Metadata,
                  summary: response.Summary,
                  rightsizingRecommendations: response.RightsizingRecommendations || [],
                  nextPageToken: response.NextPageToken,
                  configuration: response.Configuration,
              };
    } catch (err) {
      return { error: 'Failed to creates recommendations that help you reduce cost and improve efficiency', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
