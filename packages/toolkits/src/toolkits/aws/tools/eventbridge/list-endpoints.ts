import { tool } from 'ai';
import { z } from 'zod';
import { ListEndpointsCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsListEventbridgeEndpoints = tool({
  description: 'List EventBridge endpoints. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namePrefix: z.string().optional().describe('Filter by name prefix'),
    homeRegion: z.string().optional().describe('Home region'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of endpoints to return'),
  }),
  execute: async ({ awsCredentials, region, namePrefix, homeRegion, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new ListEndpointsCommand({
          NamePrefix: namePrefix,
          HomeRegion: homeRegion,
          NextToken: nextToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  endpoints: response.Endpoints || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list EventBridge endpoints', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
