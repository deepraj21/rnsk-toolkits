import { tool } from 'ai';
import { z } from 'zod';
import { GetAppCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsGetAmplifyApp = tool({
  description: 'Retrieves an existing Amplify app. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
  }),
  execute: async ({ awsCredentials, region, appId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new GetAppCommand({
          appId,
      });
      const response = await client.send(command);
      return {
                  app: response.app,
              };
    } catch (err) {
      return { error: 'Failed to retrieves an existing Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
