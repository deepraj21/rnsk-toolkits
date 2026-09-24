import { tool } from 'ai';
import { z } from 'zod';
import { DescribeConfigurationAggregatorsCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeConfigurationAggregators = tool({
  description: 'Returns the details of one or more configuration aggregators. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configurationAggregatorNames: z.array(z.string()).optional().describe('List of configuration aggregator names'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, configurationAggregatorNames, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeConfigurationAggregatorsCommand({
          ConfigurationAggregatorNames: configurationAggregatorNames,
          NextToken: nextToken,
          Limit: limit,
      });
      const response = await client.send(command);
      return {
                  configurationAggregators: response.ConfigurationAggregators || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns the details of one or more configuration aggregators', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
