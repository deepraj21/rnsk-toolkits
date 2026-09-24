import { tool } from 'ai';
import { z } from 'zod';
import { ListEventDataStoresCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsListEventDataStores = tool({
  description: 'Returns information about all event data stores in the account, in the current region. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new ListEventDataStoresCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  eventDataStores: response.EventDataStores || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns information about all event data stores in the account, in the current region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
