import { tool } from 'ai';
import { z } from 'zod';
import { CreateSubscriptionCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsCreateSubscription = tool({
  description: 'Subscribe to AWS Shield Advanced (costs $3000/month). Use it to provision a new resource.',
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

      const command = new CreateSubscriptionCommand({});
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to subscribe to AWS Shield Advanced (costs $3000/month)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
