import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRetentionConfigurationCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteRetentionConfiguration = tool({
  description: 'Deletes the retention configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    retentionConfigurationName: z.string().describe('The name of the retention configuration to delete'),
  }),
  execute: async ({ awsCredentials, region, retentionConfigurationName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteRetentionConfigurationCommand({
          RetentionConfigurationName: retentionConfigurationName,
      });
      await client.send(command);
      return {
                  message: 'Retention configuration deleted successfully',
                  retentionConfigurationName: retentionConfigurationName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the retention configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
