import { tool } from 'ai';
import { z } from 'zod';
import { CreateCostCategoryDefinitionCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsCreateCostCategoryDefinition = tool({
  description: 'Creates a new Cost Category with the requested name and rules. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the Cost Category'),
    ruleVersion: z.enum(['CostCategoryExpression.v1']).describe('The rule version'),
    rules: z.array(z.record(z.any())).describe('The Cost Category rules'),
    defaultValue: z.string().optional().describe('The default value for the cost category'),
    splitChargeRules: z.array(z.record(z.any())).optional().describe('The split charge rules'),
    resourceTags: z.array(z.record(z.any())).optional().describe('Resource tags'),
  }),
  execute: async ({ awsCredentials, region, name, ruleVersion, rules, defaultValue, splitChargeRules, resourceTags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new CreateCostCategoryDefinitionCommand({
          Name: name,
          RuleVersion: ruleVersion,
          Rules: rules,
          DefaultValue: defaultValue,
          SplitChargeRules: splitChargeRules,
          ResourceTags: resourceTags,
      } as any);
      const response = await client.send(command);
      return {
                  costCategoryArn: response.CostCategoryArn,
                  effectiveStart: response.EffectiveStart,
              };
    } catch (err) {
      return { error: 'Failed to creates a new Cost Category with the requested name and rules', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
