import { tool } from 'ai';
import { z } from 'zod';
import { ListBranchesCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsListAmplifyBranches = tool({
  description: 'Lists the branches of an Amplify app. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    maxResults: z.number().optional().describe('Maximum number of branches to return'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, appId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new ListBranchesCommand({
          appId,
          maxResults,
          nextToken,
      });
      const response = await client.send(command);
      return {
                  branches: response.branches || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to lists the branches of an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
