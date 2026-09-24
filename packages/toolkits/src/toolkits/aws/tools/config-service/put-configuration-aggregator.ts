import { tool } from 'ai';
import { z } from 'zod';
import { PutConfigurationAggregatorCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutConfigurationAggregator = tool({
  description: 'Creates and updates the configuration aggregator. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configurationAggregatorName: z.string().describe('The name of the configuration aggregator'),
    accountAggregationSources: z.array(z.record(z.any())).optional().describe('Account aggregation sources'),
    organizationAggregationSource: z.record(z.any()).optional().describe('Organization aggregation source'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, configurationAggregatorName, accountAggregationSources, organizationAggregationSource, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutConfigurationAggregatorCommand({
          ConfigurationAggregatorName: configurationAggregatorName,
          AccountAggregationSources: accountAggregationSources,
          OrganizationAggregationSource: organizationAggregationSource,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  configurationAggregator: response.ConfigurationAggregator,
              };
    } catch (err) {
      return { error: 'Failed to creates and updates the configuration aggregator', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
