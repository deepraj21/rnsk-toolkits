import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBackendEnvironmentCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsDeleteAmplifyBackendEnvironment = tool({
  description: 'Deletes a backend environment for an Amplify app. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    environmentName: z.string().describe('The name of the backend environment'),
  }),
  execute: async ({ awsCredentials, region, appId, environmentName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new DeleteBackendEnvironmentCommand({
          appId,
          environmentName,
      });
      const response = await client.send(command);
      return {
                  backendEnvironment: response.backendEnvironment,
              };
    } catch (err) {
      return { error: 'Failed to deletes a backend environment for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
