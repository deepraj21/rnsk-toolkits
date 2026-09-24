import { tool } from 'ai';
import { z } from 'zod';
import { DescribeCostCategoryDefinitionCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsDescribeCostCategoryDefinition = tool({
  description: 'Returns the name, ARN, rules, definition, and effective dates of a Cost Category. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    costCategoryArn: z.string().describe('The ARN of the Cost Category'),
    effectiveOn: z.string().optional().describe('The date when the Cost Category was effective'),
  }),
  execute: async ({ awsCredentials, region, costCategoryArn, effectiveOn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new DescribeCostCategoryDefinitionCommand({
          CostCategoryArn: costCategoryArn,
          EffectiveOn: effectiveOn,
      });
      const response = await client.send(command);
      return {
                  costCategory: response.CostCategory,
              };
    } catch (err) {
      return { error: 'Failed to returns the name, ARN, rules, definition, and effective dates of a Cost Category', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
