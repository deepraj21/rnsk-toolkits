import { tool } from 'ai';
import { z } from 'zod';
import { GetBillingViewCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsGetBillingView = tool({
  description: 'Get details about a specific billing view. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    billingViewArn: z.string().describe('The ARN of the billing view'),
  }),
  execute: async ({ awsCredentials, region, billingViewArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new GetBillingViewCommand({
          billingViewArn: billingViewArn,
      } as any);
      const response = await client.send(command) as any;
      return {
                  billingView: response.billingView ? {
                      billingViewArn: response.billingView.billingViewArn,
                      billingViewName: response.billingView.billingViewName,
                      description: response.billingView.description,
                      ownerAccountId: response.billingView.ownerAccountId,
                      createdAt: response.billingView.createdAt,
                      lastModifiedAt: response.billingView.lastModifiedAt,
                      viewDefinition: response.billingView.viewDefinition,
                  } : null,
              };
    } catch (err) {
      return { error: 'Failed to get details about a specific billing view', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
