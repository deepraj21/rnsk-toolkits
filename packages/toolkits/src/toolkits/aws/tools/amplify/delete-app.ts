import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAppCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsDeleteAmplifyApp = tool({
  description: 'Deletes an existing Amplify app. Use it to permanently remove the resource.',
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

      const command = new DeleteAppCommand({
          appId,
      });
      const response = await client.send(command);
      return {
                  app: response.app,
              };
    } catch (err) {
      return { error: 'Failed to deletes an existing Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
