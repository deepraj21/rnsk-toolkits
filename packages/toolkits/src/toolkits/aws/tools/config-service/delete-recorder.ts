import { tool } from 'ai';
import { z } from 'zod';
import { DeleteConfigurationRecorderCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteConfigRecorder = tool({
  description: 'Deletes the configuration recorder. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configurationRecorderName: z.string().describe('The name of the configuration recorder to delete'),
  }),
  execute: async ({ awsCredentials, region, configurationRecorderName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteConfigurationRecorderCommand({
          ConfigurationRecorderName: configurationRecorderName,
      });
      await client.send(command);
      return {
                  message: 'Configuration recorder deleted successfully',
                  configurationRecorderName: configurationRecorderName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the configuration recorder', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
