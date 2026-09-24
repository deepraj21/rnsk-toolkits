import { tool } from 'ai';
import { z } from 'zod';
import { UpdateWebhookCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsUpdateAmplifyWebhook = tool({
  description: 'Updates a webhook. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    webhookId: z.string().describe('The unique ID for a webhook'),
    branchName: z.string().optional().describe('The name for a branch that is part of an Amplify app'),
    description: z.string().optional().describe('The description for a webhook'),
  }),
  execute: async ({ awsCredentials, region, webhookId, branchName, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new UpdateWebhookCommand({
          webhookId: webhookId,
          branchName: branchName,
          description: description,
      });
      const response = await client.send(command);
      return {
                  webhook: response.webhook,
              };
    } catch (err) {
      return { error: 'Failed to updates a webhook', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
