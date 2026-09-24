import { tool } from 'ai';
import { z } from 'zod';
import { DeleteComputeEnvironmentCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsDeleteBatchComputeEnvironment = tool({
  description: 'Delete a Batch compute environment. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    computeEnvironment: z.string().describe('The name of the compute environment to delete'),
  }),
  execute: async ({ awsCredentials, region, computeEnvironment }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DeleteComputeEnvironmentCommand({
          computeEnvironment: computeEnvironment,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Compute environment ${computeEnvironment} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a Batch compute environment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
