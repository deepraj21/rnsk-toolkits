import { tool } from 'ai';
import { z } from 'zod';
import { DescribeConfigRuleEvaluationStatusCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeConfigRuleEvaluationStatus = tool({
  description: 'Returns status information for each of your Config managed rules. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleNames: z.array(z.string()).optional().describe('List of Config rule names'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, configRuleNames, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeConfigRuleEvaluationStatusCommand({
          ConfigRuleNames: configRuleNames,
          NextToken: nextToken,
          Limit: limit,
      });
      const response = await client.send(command);
      return {
                  configRulesEvaluationStatus: response.ConfigRulesEvaluationStatus || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns status information for each of your Config managed rules', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
