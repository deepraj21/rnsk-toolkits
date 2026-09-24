import { tool } from 'ai';
import { z } from 'zod';
import { ListBillingViewsCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsListBillingViews = tool({
  description: 'List all billing views in your AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of billing views to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new ListBillingViewsCommand({
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  billingViews: response.billingViews?.map((bv: any) => ({
                      billingViewArn: bv.billingViewArn,
                      billingViewName: bv.billingViewName,
                      description: bv.description,
                      ownerAccountId: bv.ownerAccountId,
                      createdAt: bv.createdAt,
                      lastModifiedAt: bv.lastModifiedAt,
                  })) || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all billing views in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
