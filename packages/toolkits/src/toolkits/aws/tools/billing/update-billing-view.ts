import { tool } from 'ai';
import { z } from 'zod';
import { UpdateBillingViewCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsUpdateBillingView = tool({
  description: 'Update an existing billing view. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    billingViewArn: z.string().describe('The ARN of the billing view to update'),
    billingViewName: z.string().optional().describe('The new name of the billing view'),
    description: z.string().optional().describe('New description of the billing view'),
    viewDefinition: z.record(z.any()).optional().describe('The updated view definition'),
  }),
  execute: async ({ awsCredentials, region, billingViewArn, billingViewName, description, viewDefinition }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new UpdateBillingViewCommand({
          billingViewArn: billingViewArn,
          billingViewName: billingViewName,
          description: description,
          viewDefinition: viewDefinition,
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
      return { error: 'Failed to update an existing billing view', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
