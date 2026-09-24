import { tool } from 'ai';
import { z } from 'zod';
import { DescribeComputeEnvironmentsCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsDescribeBatchComputeEnvironments = tool({
  description: 'Get details about one or more Batch compute environments. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    computeEnvironments: z.array(z.string()).optional().describe('List of compute environment names to describe'),
  }),
  execute: async ({ awsCredentials, region, computeEnvironments }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DescribeComputeEnvironmentsCommand({
          computeEnvironments: computeEnvironments,
      });
      const response = await client.send(command);
      return {
                  computeEnvironments: response.computeEnvironments || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more Batch compute environments', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
