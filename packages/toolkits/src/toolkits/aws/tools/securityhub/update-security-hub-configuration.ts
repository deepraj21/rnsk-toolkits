import { tool } from 'ai';
import { z } from 'zod';
import { UpdateSecurityHubConfigurationCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsUpdateSecurityHubConfiguration = tool({
  description: 'Update Security Hub configuration settings. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoEnableControls: z.boolean().optional().describe('Automatically enable new controls when they are added'),
    controlFindingGenerator: z.enum(['SECURITY_CONTROL', 'STANDARD_CONTROL']).optional().describe('Method for generating control findings'),
  }),
  execute: async ({ awsCredentials, region, autoEnableControls, controlFindingGenerator }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new UpdateSecurityHubConfigurationCommand({
          AutoEnableControls: autoEnableControls,
          ControlFindingGenerator: controlFindingGenerator,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update Security Hub configuration settings', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
