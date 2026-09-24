import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRetentionConfigurationsCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeRetentionConfigurations = tool({
  description: 'Returns the details of one or more retention configurations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    retentionConfigurationNames: z.array(z.string()).optional().describe('List of retention configuration names'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, retentionConfigurationNames, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeRetentionConfigurationsCommand({
          RetentionConfigurationNames: retentionConfigurationNames,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  retentionConfigurations: response.RetentionConfigurations || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to returns the details of one or more retention configurations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
