import { tool } from 'ai';
import { z } from 'zod';
import { PutRemediationConfigurationsCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutRemediationConfigurations = tool({
  description: 'Adds or updates the remediation configuration with a specific Config rule. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    remediationConfigurations: z.enum(['SSM_DOCUMENT']).describe('List of remediation configurations'),
  }),
  execute: async ({ awsCredentials, region, remediationConfigurations }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutRemediationConfigurationsCommand({
          RemediationConfigurations: remediationConfigurations,
      } as any);
      const response = await client.send(command);
      return {
                  failedBatches: response.FailedBatches || [],
              };
    } catch (err) {
      return { error: 'Failed to adds or updates the remediation configuration with a specific Config rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
