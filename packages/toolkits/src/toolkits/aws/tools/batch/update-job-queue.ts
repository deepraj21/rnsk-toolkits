import { tool } from 'ai';
import { z } from 'zod';
import { UpdateJobQueueCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsUpdateBatchJobQueue = tool({
  description: 'Update an existing Batch job queue. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobQueue: z.string().describe('The name of the job queue'),
    state: z.enum(['ENABLED', 'DISABLED']).optional().describe('The state of the job queue (ENABLED, DISABLED)'),
    priority: z.number().optional().describe('Priority of the job queue'),
    computeEnvironmentOrder: z.array(z.record(z.any())).optional().describe('Order of compute environments'),
  }),
  execute: async ({ awsCredentials, region, jobQueue, state, priority, computeEnvironmentOrder }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new UpdateJobQueueCommand({
          jobQueue: jobQueue,
          state: state,
          priority: priority,
          computeEnvironmentOrder: computeEnvironmentOrder,
      } as any);
      const response = await client.send(command);
      return {
                  jobQueueName: response.jobQueueName,
                  jobQueueArn: response.jobQueueArn,
              };
    } catch (err) {
      return { error: 'Failed to update an existing Batch job queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
