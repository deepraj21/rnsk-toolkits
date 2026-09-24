import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRegistryCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsDescribeRegistry = tool({
  description: 'Get details about the registry. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DescribeRegistryCommand({});
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  replicationConfiguration: response.replicationConfiguration,
              };
    } catch (err) {
      return { error: 'Failed to get details about the registry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
