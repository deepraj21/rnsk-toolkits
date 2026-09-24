import { tool } from 'ai';
import { z } from 'zod';
import { PutConfigurationRecorderCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutConfigRecorder = tool({
  description: 'Creates a new configuration recorder to record configuration changes. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configurationRecorder: z.record(z.any()).describe('Configuration recorder object'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, configurationRecorder, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutConfigurationRecorderCommand({
          ConfigurationRecorder: configurationRecorder,
          Tags: tags,
      });
      await client.send(command);
      return {
                  message: 'Configuration recorder created/updated successfully',
              };
    } catch (err) {
      return { error: 'Failed to creates a new configuration recorder to record configuration changes', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
