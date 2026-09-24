import { tool } from 'ai';
import { z } from 'zod';
import { DeleteSubscriptionCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsDeleteSubscription = tool({
  description: 'Cancel AWS Shield Advanced subscription. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new DeleteSubscriptionCommand({});
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to cancel AWS Shield Advanced subscription', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
