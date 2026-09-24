import { tool } from 'ai';
import { z } from 'zod';
import { ListChannelsCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsListChannels = tool({
  description: 'Returns information about all channels. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new ListChannelsCommand({
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  channels: response.Channels || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns information about all channels', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
