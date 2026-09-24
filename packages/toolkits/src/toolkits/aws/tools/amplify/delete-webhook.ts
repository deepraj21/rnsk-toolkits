import { tool } from 'ai';
import { z } from 'zod';
import { DeleteWebhookCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsDeleteAmplifyWebhook = tool({
  description: 'Deletes a webhook. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    webhookId: z.string().describe('The unique ID for a webhook'),
  }),
  execute: async ({ awsCredentials, region, webhookId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new DeleteWebhookCommand({
          webhookId,
      });
      const response = await client.send(command);
      return {
                  webhook: response.webhook,
              };
    } catch (err) {
      return { error: 'Failed to deletes a webhook', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
