import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBillingViewCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsDeleteBillingView = tool({
  description: 'Delete a billing view. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    billingViewArn: z.string().describe('The ARN of the billing view to delete'),
  }),
  execute: async ({ awsCredentials, region, billingViewArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new DeleteBillingViewCommand({
          billingViewArn: billingViewArn,
      } as any);
      const response = await client.send(command) as any;
      return {
                  billingViewArn: response.billingViewArn,
              };
    } catch (err) {
      return { error: 'Failed to delete a billing view', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
