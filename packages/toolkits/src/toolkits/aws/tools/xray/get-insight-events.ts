import { tool } from 'ai';
import { z } from 'zod';
import { GetInsightEventsCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetInsightEvents = tool({
  description: 'X-Ray reevaluates insights periodically until they are resolved, and records each intermediate state in an event. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    insightId: z.string().describe('The insight unique identifier'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, insightId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetInsightEventsCommand({
          InsightId: insightId,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  insightEvents: response.InsightEvents || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to x-Ray reevaluates insights periodically until they are resolved, and records each intermediate state in an event', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
