import { tool } from 'ai';
import { z } from 'zod';
import { DescribeCapacityProvidersCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsCapacityProviders = tool({
  description: 'List all capacity providers (uses DescribeCapacityProvidersCommand). Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of providers to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      // Use DescribeCapacityProvidersCommand without specifying capacityProviders to list all
      const command = new DescribeCapacityProvidersCommand({
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  capacityProviders: response.capacityProviders || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all capacity providers (uses DescribeCapacityProvidersCommand)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
