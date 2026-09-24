import { tool } from 'ai';
import { z } from 'zod';
import { DeleteCostCategoryDefinitionCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsDeleteCostCategoryDefinition = tool({
  description: 'Deletes a Cost Category. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    costCategoryArn: z.string().describe('The ARN of the Cost Category'),
  }),
  execute: async ({ awsCredentials, region, costCategoryArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new DeleteCostCategoryDefinitionCommand({
          CostCategoryArn: costCategoryArn,
      });
      const response = await client.send(command);
      return {
                  costCategoryArn: response.CostCategoryArn,
                  effectiveEnd: response.EffectiveEnd,
              };
    } catch (err) {
      return { error: 'Failed to deletes a Cost Category', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
