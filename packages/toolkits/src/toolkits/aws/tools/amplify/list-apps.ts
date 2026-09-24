import { tool } from 'ai';
import { z } from 'zod';
import { ListAppsCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsListAmplifyApps = tool({
  description: 'Lists existing Amplify apps. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of apps to return'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new ListAppsCommand({
          maxResults,
          nextToken,
      });
      const response = await client.send(command);
      return {
                  apps: response.apps || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to lists existing Amplify apps', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
