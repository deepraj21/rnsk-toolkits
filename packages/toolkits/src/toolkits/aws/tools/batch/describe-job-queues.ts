import { tool } from 'ai';
import { z } from 'zod';
import { DescribeJobQueuesCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsDescribeBatchJobQueues = tool({
  description: 'Get details about one or more Batch job queues. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobQueues: z.array(z.string()).optional().describe('List of job queue names to describe'),
  }),
  execute: async ({ awsCredentials, region, jobQueues }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DescribeJobQueuesCommand({
          jobQueues: jobQueues,
      });
      const response = await client.send(command);
      return {
                  jobQueues: response.jobQueues || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more Batch job queues', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
