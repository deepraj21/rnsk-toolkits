import { tool } from 'ai';
import { z } from 'zod';
import { ListTrailsCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsListTrails = tool({
  description: 'Lists trails that are in the current account, or all trails in the current region. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new ListTrailsCommand({
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  trails: response.Trails || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to lists trails that are in the current account, or all trails in the current region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
