import { tool } from 'ai';
import { z } from 'zod';
import { StopConfigurationRecorderCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsStopConfigRecorder = tool({
  description: 'Stops recording configurations of the AWS resources. Use it to stop a running resource (billable config may remain).',
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

      const command = new StopConfigurationRecorderCommand({
          ConfigurationRecorderName: configurationRecorderName,
      });
      await client.send(command);
      return {
                  message: 'Configuration recorder stopped successfully',
                  configurationRecorderName: configurationRecorderName,
              };
    } catch (err) {
      return { error: 'Failed to stops recording configurations of the AWS resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
