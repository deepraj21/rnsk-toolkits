import { tool } from 'ai';
import { z } from 'zod';
import { DeregisterJobDefinitionCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsDeregisterBatchJobDefinition = tool({
  description: 'Deregister a Batch job definition. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobDefinition: z.string().describe('The name and revision of the job definition'),
  }),
  execute: async ({ awsCredentials, region, jobDefinition }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DeregisterJobDefinitionCommand({
          jobDefinition: jobDefinition,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Job definition ${jobDefinition} deregistered successfully`,
              };
    } catch (err) {
      return { error: 'Failed to deregister a Batch job definition', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
