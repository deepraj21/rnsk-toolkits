import { tool } from 'ai';
import { z } from 'zod';
import { ListCostCategoryDefinitionsCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsListCostCategoryDefinitions = tool({
  description: 'Returns the name, ARN, effective date, and number of rules for all Cost Categories defined in the account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    effectiveOn: z.string().optional().describe('The date when the Cost Category was effective'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, effectiveOn, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new ListCostCategoryDefinitionsCommand({
          EffectiveOn: effectiveOn,
          NextToken: nextToken,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  costCategoryReferences: response.CostCategoryReferences || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns the name, ARN, effective date, and number of rules for all Cost Categories defined in the account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
