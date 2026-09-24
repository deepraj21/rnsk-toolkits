import { tool } from 'ai';
import { z } from 'zod';
import { StartConfigRulesEvaluationCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsStartConfigRulesEvaluation = tool({
  description: 'Runs an evaluation for the specified Config rules. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleNames: z.array(z.string()).optional().describe('List of Config rule names to evaluate'),
  }),
  execute: async ({ awsCredentials, region, configRuleNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new StartConfigRulesEvaluationCommand({
          ConfigRuleNames: configRuleNames,
      });
      await client.send(command);
      return {
                  message: 'Config rules evaluation started successfully',
              };
    } catch (err) {
      return { error: 'Failed to runs an evaluation for the specified Config rules', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
