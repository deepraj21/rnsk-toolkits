import { tool } from 'ai';
import { z } from 'zod';
import { PutRetentionConfigurationCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutRetentionConfiguration = tool({
  description: 'Creates and updates the retention configuration. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    retentionPeriodInDays: z.number().describe('Number of days Config stores your historical information'),
  }),
  execute: async ({ awsCredentials, region, retentionPeriodInDays }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutRetentionConfigurationCommand({
          RetentionPeriodInDays: retentionPeriodInDays,
      });
      const response = await client.send(command);
      return {
                  retentionConfiguration: response.RetentionConfiguration,
              };
    } catch (err) {
      return { error: 'Failed to creates and updates the retention configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
