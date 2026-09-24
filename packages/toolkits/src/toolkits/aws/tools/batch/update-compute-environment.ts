import { tool } from 'ai';
import { z } from 'zod';
import { UpdateComputeEnvironmentCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsUpdateBatchComputeEnvironment = tool({
  description: 'Update an existing Batch compute environment. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    computeEnvironment: z.string().describe('The name of the compute environment'),
    state: z.enum(['ENABLED', 'DISABLED']).optional().describe('The state of the compute environment (ENABLED, DISABLED)'),
    computeResources: z.record(z.any()).optional().describe('Compute resources configuration to update'),
    serviceRole: z.string().optional().describe('IAM role ARN for the compute environment'),
  }),
  execute: async ({ awsCredentials, region, computeEnvironment, state, computeResources, serviceRole }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new UpdateComputeEnvironmentCommand({
          computeEnvironment: computeEnvironment,
          state: state,
          computeResources: computeResources,
          serviceRole: serviceRole,
      });
      const response = await client.send(command);
      return {
                  computeEnvironmentName: response.computeEnvironmentName,
                  computeEnvironmentArn: response.computeEnvironmentArn,
              };
    } catch (err) {
      return { error: 'Failed to update an existing Batch compute environment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
