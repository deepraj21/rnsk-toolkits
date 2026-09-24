import { tool } from 'ai';
import { z } from 'zod';
import { CreateRuleGroupCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsCreateRuleGroup = tool({
  description: 'Create a custom rule group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the rule group'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope'),
    capacity: z.number().describe('Rule capacity units (WCU)'),
    rules: z.array(z.record(z.any())).optional().describe('Rules in the group'),
    visibilityConfig: z.record(z.any()).describe('CloudWatch metrics configuration'),
    description: z.string().optional().describe('Description of the rule group'),
  }),
  execute: async ({ awsCredentials, region, name, scope, capacity, rules, visibilityConfig, description }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new CreateRuleGroupCommand({
          Name: name,
          Scope: scope,
          Capacity: capacity,
          Rules: rules,
          VisibilityConfig: visibilityConfig,
          Description: description,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a custom rule group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
