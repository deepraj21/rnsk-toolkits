import { tool } from 'ai';
import { z } from 'zod';
import { StartConfigurationRecorderCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsStartConfigRecorder = tool({
  description: 'Starts recording configurations of the AWS resources. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configurationRecorderName: z.string().optional().describe('The name of the configuration recorder'),
  }),
  execute: async ({ awsCredentials, region, configurationRecorderName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new StartConfigurationRecorderCommand({
          ConfigurationRecorderName: configurationRecorderName,
      });
      await client.send(command);
      return {
                  message: 'Configuration recorder started successfully',
                  configurationRecorderName: configurationRecorderName,
              };
    } catch (err) {
      return { error: 'Failed to starts recording configurations of the AWS resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
