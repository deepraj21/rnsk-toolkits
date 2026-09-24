import { tool } from 'ai';
import { z } from 'zod';
import { ListSourceViewsForBillingViewCommand } from '@aws-sdk/client-billing';
import { createBillingClient } from '../client.js';

export const awsListSourceViewsForBillingView = tool({
  description: 'List source views associated with a billing view. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    billingViewArn: z.string().describe('The ARN of the billing view'),
    maxResults: z.number().optional().describe('Maximum number of source views to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, billingViewArn, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBillingClient(awsCredentials, region);

      const command = new ListSourceViewsForBillingViewCommand({
          billingViewArn: billingViewArn,
          maxResults: maxResults,
          nextToken: nextToken,
      } as any);
      const response = await client.send(command) as any;
      return {
                  sourceViews: response.sourceViews?.map((sv: any) => ({
                      sourceViewArn: sv.sourceViewArn,
                      sourceViewName: sv.sourceViewName,
                      description: sv.description,
                      ownerAccountId: sv.ownerAccountId,
                      createdAt: sv.createdAt,
                      lastModifiedAt: sv.lastModifiedAt,
                      viewDefinition: sv.viewDefinition,
                  })) || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list source views associated with a billing view', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
