import { tool } from 'ai';
import { z } from 'zod';
import { DeleteConfigRuleCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteConfigRule = tool({
  description: 'Deletes the specified Config rule. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleName: z.string().describe('The name of the Config rule to delete'),
  }),
  execute: async ({ awsCredentials, region, configRuleName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteConfigRuleCommand({
          ConfigRuleName: configRuleName,
      });
      await client.send(command);
      return {
                  message: 'Config rule deleted successfully',
                  configRuleName: configRuleName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the specified Config rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
