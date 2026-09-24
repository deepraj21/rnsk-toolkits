import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRemediationConfigurationsCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeRemediationConfigurations = tool({
  description: 'Returns the details of one or more remediation configurations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleNames: z.array(z.string()).describe('List of Config rule names'),
  }),
  execute: async ({ awsCredentials, region, configRuleNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeRemediationConfigurationsCommand({
          ConfigRuleNames: configRuleNames,
      });
      const response = await client.send(command);
      return {
                  remediationConfigurations: response.RemediationConfigurations || [],
              };
    } catch (err) {
      return { error: 'Failed to returns the details of one or more remediation configurations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
