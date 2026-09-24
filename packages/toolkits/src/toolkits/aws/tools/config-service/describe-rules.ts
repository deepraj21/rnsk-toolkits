import { tool } from 'ai';
import { z } from 'zod';
import { DescribeConfigRulesCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeConfigRules = tool({
  description: 'Returns details about your Config rules. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleNames: z.array(z.string()).optional().describe('List of Config rule names'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, configRuleNames, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeConfigRulesCommand({
          ConfigRuleNames: configRuleNames,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  configRules: response.ConfigRules || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns details about your Config rules', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
