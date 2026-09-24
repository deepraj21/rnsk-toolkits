import { tool } from 'ai';
import { z } from 'zod';
import { DescribeComputeEnvironmentsCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsListBatchComputeEnvironments = tool({
  description: 'List all Batch compute environments in your AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of compute environments to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DescribeComputeEnvironmentsCommand({
          computeEnvironments: undefined, // When undefined, lists all
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  computeEnvironments: response.computeEnvironments || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all Batch compute environments in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
