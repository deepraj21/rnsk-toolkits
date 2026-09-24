import { tool } from 'ai';
import { z } from 'zod';
import { CreateComputeEnvironmentCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsCreateBatchComputeEnvironment = tool({
  description: 'Create a new Batch compute environment. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    computeEnvironmentName: z.string().describe('The name of the compute environment'),
    type: z.enum(['MANAGED', 'UNMANAGED']).describe('The type of compute environment (MANAGED, UNMANAGED)'),
    state: z.enum(['ENABLED', 'DISABLED']).optional().describe('The state of the compute environment (ENABLED, DISABLED)'),
    serviceRole: z.string().optional().describe('IAM role ARN for the compute environment'),
    computeResources: z.record(z.any()).optional().describe('Compute resources configuration'),
    tags: z.record(z.any()).optional().describe('Tags as key-value pairs'),
  }),
  execute: async ({ awsCredentials, region, computeEnvironmentName, type, state, serviceRole, computeResources, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new CreateComputeEnvironmentCommand({
          computeEnvironmentName: computeEnvironmentName,
          type: type,
          state: state,
          serviceRole: serviceRole,
          computeResources: computeResources,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  computeEnvironmentName: response.computeEnvironmentName,
                  computeEnvironmentArn: response.computeEnvironmentArn,
              };
    } catch (err) {
      return { error: 'Failed to create a new Batch compute environment', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
