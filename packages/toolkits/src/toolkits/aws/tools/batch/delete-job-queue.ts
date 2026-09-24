import { tool } from 'ai';
import { z } from 'zod';
import { DeleteJobQueueCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsDeleteBatchJobQueue = tool({
  description: 'Delete a Batch job queue. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobQueue: z.string().describe('The name of the job queue to delete'),
  }),
  execute: async ({ awsCredentials, region, jobQueue }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DeleteJobQueueCommand({
          jobQueue: jobQueue,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Job queue ${jobQueue} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a Batch job queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
