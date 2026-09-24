import { tool } from 'ai';
import { z } from 'zod';
import { CreateBillingViewCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsCreateBillingView = tool({
  description: 'Create a new billing view. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    billingViewName: z.string().describe('The name of the billing view'),
    description: z.string().optional().describe('Description of the billing view'),
    viewDefinition: z.record(z.any()).describe('The view definition containing filters and aggregations'),
  }),
  execute: async ({ awsCredentials, region, billingViewName, description, viewDefinition }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new CreateBillingViewCommand({
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
      return { error: 'Failed to create a new billing view', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
