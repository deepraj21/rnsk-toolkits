import { tool } from 'ai';
import { z } from 'zod';
import { ListWebhooksCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsListAmplifyWebhooks = tool({
  description: 'Returns the webhooks for an Amplify app. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    maxResults: z.number().optional().describe('Maximum number of webhooks to return'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, appId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new ListWebhooksCommand({
          appId,
          maxResults,
          nextToken,
      });
      const response = await client.send(command);
      return {
                  webhooks: response.webhooks || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns the webhooks for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
