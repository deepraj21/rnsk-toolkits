import { tool } from 'ai';
import { z } from 'zod';
import { DescribeCapacityProvidersCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDescribeEcsCapacityProviders = tool({
  description: 'Get details about one or more capacity providers. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    capacityProviders: z.array(z.string()).optional().describe('List of capacity provider names to describe'),
    include: z.array(z.string()).optional().describe('Additional information to include (TAGS)'),
  }),
  execute: async ({ awsCredentials, region, capacityProviders, include }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DescribeCapacityProvidersCommand({
          capacityProviders: capacityProviders,
          include: include as any,
      });
      const response = await client.send(command);
      return {
                  capacityProviders: response.capacityProviders || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more capacity providers', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
