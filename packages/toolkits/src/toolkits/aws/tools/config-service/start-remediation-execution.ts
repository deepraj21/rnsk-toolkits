import { tool } from 'ai';
import { z } from 'zod';
import { StartRemediationExecutionCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsStartRemediationExecution = tool({
  description: 'Runs an on-demand remediation for the specified Config rules. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleName: z.string().describe('The name of the Config rule'),
    resourceKeys: z.array(z.record(z.any())).describe('List of resource keys'),
  }),
  execute: async ({ awsCredentials, region, configRuleName, resourceKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new StartRemediationExecutionCommand({
          ConfigRuleName: configRuleName,
          ResourceKeys: resourceKeys,
      } as any);
      const response = await client.send(command);
      return {
                  failureMessage: response.FailureMessage,
                  failedItems: response.FailedItems || [],
              };
    } catch (err) {
      return { error: 'Failed to runs an on-demand remediation for the specified Config rules', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
