import { tool } from 'ai';
import { z } from 'zod';
import { UpdateCostCategoryDefinitionCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsUpdateCostCategoryDefinition = tool({
  description: 'Updates an existing Cost Category. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    costCategoryArn: z.string().describe('The ARN of the Cost Category'),
    ruleVersion: z.enum(['CostCategoryExpression.v1']).describe('The rule version'),
    rules: z.array(z.record(z.any())).describe('The Cost Category rules'),
    defaultValue: z.string().optional().describe('The default value for the cost category'),
    splitChargeRules: z.array(z.record(z.any())).optional().describe('The split charge rules'),
    resourceTags: z.array(z.record(z.any())).optional().describe('Resource tags'),
  }),
  execute: async ({ awsCredentials, region, costCategoryArn, ruleVersion, rules, defaultValue, splitChargeRules, resourceTags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new UpdateCostCategoryDefinitionCommand({
          CostCategoryArn: costCategoryArn,
          RuleVersion: ruleVersion,
          Rules: rules,
          DefaultValue: defaultValue,
          SplitChargeRules: splitChargeRules,
      } as any);
      const response = await client.send(command);
      return {
                  costCategoryArn: response.CostCategoryArn,
                  effectiveStart: response.EffectiveStart,
              };
    } catch (err) {
      return { error: 'Failed to updates an existing Cost Category', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
