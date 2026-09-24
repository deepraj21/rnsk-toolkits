import { tool } from 'ai';
import { z } from 'zod';
import { DescribePendingAggregationRequestsCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribePendingAggregationRequests = tool({
  description: 'Returns a list of all pending aggregation requests. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    limit: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, limit, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribePendingAggregationRequestsCommand({
          Limit: limit,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  pendingAggregationRequests: response.PendingAggregationRequests || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns a list of all pending aggregation requests', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
