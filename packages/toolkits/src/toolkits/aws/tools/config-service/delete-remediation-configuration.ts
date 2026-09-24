import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRemediationConfigurationCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteRemediationConfiguration = tool({
  description: 'Deletes the remediation configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configRuleName: z.string().describe('The name of the Config rule for which you want to delete remediation configuration'),
    resourceType: z.string().optional().describe('The type of a resource'),
  }),
  execute: async ({ awsCredentials, region, configRuleName, resourceType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteRemediationConfigurationCommand({
          ConfigRuleName: configRuleName,
          ResourceType: resourceType,
      });
      await client.send(command);
      return {
                  message: 'Remediation configuration deleted successfully',
                  configRuleName: configRuleName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the remediation configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
