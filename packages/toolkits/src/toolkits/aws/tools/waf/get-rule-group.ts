import { tool } from 'ai';
import { z } from 'zod';
import { GetRuleGroupCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsGetRuleGroup = tool({
  description: 'Get details about a rule group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().optional().describe('Name of the rule group'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).optional().describe('Scope'),
    id: z.string().optional().describe('Unique identifier'),
    arn: z.string().optional().describe('ARN of the rule group (for managed rule groups)'),
  }),
  execute: async ({ awsCredentials, region, name, scope, id, arn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new GetRuleGroupCommand({
          Name: name,
          Scope: scope,
          Id: id,
          ARN: arn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get details about a rule group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
