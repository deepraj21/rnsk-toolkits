import { tool } from 'ai';
import { z } from 'zod';
import { DescribeConfigurationAggregatorSourcesStatusCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeConfigurationAggregatorSourcesStatus = tool({
  description: 'Returns status information for sources within an aggregator. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configurationAggregatorName: z.string().describe('The name of the configuration aggregator'),
    updateStatus: z.enum(['ACCOUNT', 'ORGANIZATION']).optional().describe('List of update statuses'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, configurationAggregatorName, updateStatus, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeConfigurationAggregatorSourcesStatusCommand({
          ConfigurationAggregatorName: configurationAggregatorName,
          UpdateStatus: updateStatus,
          NextToken: nextToken,
          Limit: limit,
      } as any);
      const response = await client.send(command);
      return {
                  aggregatedSourceStatusList: response.AggregatedSourceStatusList || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns status information for sources within an aggregator', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
