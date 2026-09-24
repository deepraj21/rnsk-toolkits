import { tool } from 'ai';
import { z } from 'zod';
import { GetDimensionValuesCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetDimensionValues = tool({
  description: 'Retrieves all available filter values for a specific filter over a period of time. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    searchString: z.string().optional().describe('Search string to filter results'),
    timePeriod: z.record(z.any()).describe('Start date in YYYY-MM-DD format'),
    dimension: z.enum(['AZ', 'INSTANCE_TYPE', 'LINKED_ACCOUNT', 'LINKED_ACCOUNT_NAME', 'OPERATION', 'PURCHASE_TYPE', 'REGION', 'SERVICE', 'SERVICE_CODE', 'USAGE_TYPE', 'USAGE_TYPE_GROUP', 'RECORD_TYPE', 'OPERATING_SYSTEM', 'TENANCY', 'SCOPE', 'PLATFORM', 'SUBSCRIPTION_ID', 'LEGAL_ENTITY_NAME', 'DEPLOYMENT_OPTION', 'DATABASE_ENGINE', 'CACHE_ENGINE', 'INSTANCE_TYPE_FAMILY', 'BILLING_ENTITY', 'RESERVATION_ID', 'RESOURCE_ID', 'RIGHTSIZING_TYPE', 'SAVINGS_PLAN_ARN', 'SAVINGS_PLANS_TYPE', 'SAVINGS_PLAN_ARN', 'SAVINGS_PLANS_TYPE']).describe('The name of the dimension'),
    context: z.enum(['COST_AND_USAGE', 'RESERVATIONS', 'SAVINGS_PLANS']).optional().describe('The context for the request'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, searchString, timePeriod, dimension, context, nextPageToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetDimensionValuesCommand({
          SearchString: searchString,
          TimePeriod: timePeriod ? {
              Start: timePeriod.start,
              End: timePeriod.end,
          } : undefined,
          Dimension: dimension,
          Context: context,
          NextPageToken: nextPageToken,
      });
      const response = await client.send(command);
      return {
                  dimensionValues: response.DimensionValues || [],
                  returnSize: response.ReturnSize,
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves all available filter values for a specific filter over a period of time', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
