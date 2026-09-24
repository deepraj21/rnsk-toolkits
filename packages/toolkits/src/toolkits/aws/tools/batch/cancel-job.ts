import { tool } from 'ai';
import { z } from 'zod';
import { CancelJobCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsCancelBatchJob = tool({
  description: 'Cancel a Batch job. Use it to cancel a running operation.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobId: z.string().describe('The ID of the job to cancel'),
    reason: z.string().optional().describe('Reason for canceling the job'),
  }),
  execute: async ({ awsCredentials, region, jobId, reason }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new CancelJobCommand({
          jobId: jobId,
          reason: reason,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Job ${jobId} canceled successfully`,
              };
    } catch (err) {
      return { error: 'Failed to cancel a Batch job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
