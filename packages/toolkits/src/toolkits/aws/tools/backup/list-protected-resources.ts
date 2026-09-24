import { tool } from 'ai';
import { z } from 'zod';
import { ListProtectedResourcesCommand } from '@aws-sdk/client-backup';
import { createBackupClient } from '../client.js';

export const awsListProtectedResources = tool({
  description: 'List protected resources. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of resources to return'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBackupClient(awsCredentials, region);

      const command = new ListProtectedResourcesCommand({
          NextToken: nextToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  results: response.Results || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list protected resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
