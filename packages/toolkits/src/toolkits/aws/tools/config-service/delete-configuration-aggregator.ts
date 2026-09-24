import { tool } from 'ai';
import { z } from 'zod';
import { DeleteConfigurationAggregatorCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteConfigurationAggregator = tool({
  description: 'Deletes the specified configuration aggregator. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configurationAggregatorName: z.string().describe('The name of the configuration aggregator to delete'),
  }),
  execute: async ({ awsCredentials, region, configurationAggregatorName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteConfigurationAggregatorCommand({
          ConfigurationAggregatorName: configurationAggregatorName,
      });
      await client.send(command);
      return {
                  message: 'Configuration aggregator deleted successfully',
                  configurationAggregatorName: configurationAggregatorName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the specified configuration aggregator', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
