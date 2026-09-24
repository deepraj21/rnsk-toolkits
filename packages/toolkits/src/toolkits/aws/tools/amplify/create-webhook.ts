import { tool } from 'ai';
import { z } from 'zod';
import { CreateWebhookCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsCreateAmplifyWebhook = tool({
  description: 'Creates a new webhook on an Amplify app. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    branchName: z.string().describe('The name for a branch that is part of an Amplify app'),
    description: z.string().optional().describe('The description for a webhook'),
  }),
  execute: async ({ awsCredentials, region, appId, branchName, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new CreateWebhookCommand({
          appId: appId,
          branchName: branchName,
          description: description,
      });
      const response = await client.send(command);
      return {
                  webhook: response.webhook,
              };
    } catch (err) {
      return { error: 'Failed to creates a new webhook on an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
