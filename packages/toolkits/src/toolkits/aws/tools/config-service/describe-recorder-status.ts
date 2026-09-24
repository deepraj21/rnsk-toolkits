import { tool } from 'ai';
import { z } from 'zod';
import { DescribeConfigurationRecorderStatusCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDescribeConfigRecorderStatus = tool({
  description: 'Returns the current status of the configuration recorder. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    configurationRecorderNames: z.array(z.string()).optional().describe('List of configuration recorder names'),
  }),
  execute: async ({ awsCredentials, region, configurationRecorderNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DescribeConfigurationRecorderStatusCommand({
          ConfigurationRecorderNames: configurationRecorderNames,
      });
      const response = await client.send(command);
      return {
                  configurationRecordersStatus: response.ConfigurationRecordersStatus || [],
              };
    } catch (err) {
      return { error: 'Failed to returns the current status of the configuration recorder', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
