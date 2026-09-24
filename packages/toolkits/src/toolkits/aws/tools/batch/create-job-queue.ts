import { tool } from 'ai';
import { z } from 'zod';
import { CreateJobQueueCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsCreateBatchJobQueue = tool({
  description: 'Create a new Batch job queue. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobQueueName: z.string().describe('The name of the job queue'),
    state: z.enum(['ENABLED', 'DISABLED']).optional().describe('The state of the job queue (ENABLED, DISABLED)'),
    priority: z.number().describe('Priority of the job queue'),
    computeEnvironmentOrder: z.array(z.record(z.any())).describe('Order of compute environments'),
    tags: z.record(z.any()).optional().describe('Tags as key-value pairs'),
  }),
  execute: async ({ awsCredentials, region, jobQueueName, state, priority, computeEnvironmentOrder, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new CreateJobQueueCommand({
          jobQueueName: jobQueueName,
          state: state,
          priority: priority,
          computeEnvironmentOrder: computeEnvironmentOrder,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  jobQueueName: response.jobQueueName,
                  jobQueueArn: response.jobQueueArn,
              };
    } catch (err) {
      return { error: 'Failed to create a new Batch job queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
