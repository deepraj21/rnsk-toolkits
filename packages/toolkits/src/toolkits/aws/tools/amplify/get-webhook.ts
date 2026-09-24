import { tool } from 'ai';
import { z } from 'zod';
import { GetWebhookCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsGetAmplifyWebhook = tool({
  description: 'Returns the webhook information that corresponds to a specified webhook ID. Use it to inspect current state before making changes.',
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

      const command = new GetWebhookCommand({
          webhookId,
      });
      const response = await client.send(command);
      return {
                  webhook: response.webhook,
              };
    } catch (err) {
      return { error: 'Failed to returns the webhook information that corresponds to a specified webhook ID', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
