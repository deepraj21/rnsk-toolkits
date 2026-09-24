import { tool } from 'ai';
import { z } from 'zod';
import { DescribeLaunchConfigurationsCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeLaunchConfigurations = tool({
  description: 'Describe launch configurations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    launchConfigurationNames: z.array(z.string()).optional().describe('Names of launch configurations'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, launchConfigurationNames, nextToken, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeLaunchConfigurationsCommand({
          LaunchConfigurationNames: launchConfigurationNames,
          NextToken: nextToken,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return {
                  launchConfigurations: response.LaunchConfigurations,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe launch configurations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
