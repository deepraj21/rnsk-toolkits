import { tool } from 'ai';
import { z } from 'zod';
import { GetResourcePolicyCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsGetBillingViewResourcePolicy = tool({
  description: 'Get the resource-based policy attached to a billing view. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The ARN of the billing view resource'),
  }),
  execute: async ({ awsCredentials, region, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new GetResourcePolicyCommand({
          resourceArn: resourceArn,
      });
      const response = await client.send(command);
      return {
                  policy: response.policy,
              };
    } catch (err) {
      return { error: 'Failed to get the resource-based policy attached to a billing view', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
