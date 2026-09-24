import { tool } from 'ai';
import { z } from 'zod';
import { GetRegistryScanningConfigurationCommand, PutRegistryScanningConfigurationCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsPutRegistryScanningConfiguration = tool({
  description: 'Create or update the registry scanning configuration. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    scanType: z.enum(['BASIC', 'ENHANCED']).optional().describe('The scanning type (BASIC, ENHANCED)'),
    rules: z.array(z.record(z.any())).optional().describe('The scanning rules'),
  }),
  execute: async ({ awsCredentials, region, scanType, rules }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new PutRegistryScanningConfigurationCommand({
          scanType: scanType as 'BASIC' | 'ENHANCED' | undefined,
          rules: rules,
      } as any);
      await client.send(command);
      // Get the updated configuration to return
      const getCommand = new GetRegistryScanningConfigurationCommand({});
      const response = await client.send(getCommand);
      return {
                  registryScanningConfiguration: response.scanningConfiguration,
              };
    } catch (err) {
      return { error: 'Failed to create or update the registry scanning configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
