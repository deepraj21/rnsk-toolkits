import { tool } from 'ai';
import { z } from 'zod';
import { ListBackendEnvironmentsCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsListAmplifyBackendEnvironments = tool({
  description: 'Lists the backend environments for an Amplify app. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    environmentName: z.string().optional().describe('The name of the backend environment'),
    maxResults: z.number().optional().describe('Maximum number of backend environments to return'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, appId, environmentName, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new ListBackendEnvironmentsCommand({
          appId,
          environmentName,
          maxResults,
          nextToken,
      });
      const response = await client.send(command);
      return {
                  backendEnvironments: response.backendEnvironments || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to lists the backend environments for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
