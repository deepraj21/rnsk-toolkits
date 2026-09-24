import { tool } from 'ai';
import { z } from 'zod';
import { DescribeJobQueuesCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsListBatchJobQueues = tool({
  description: 'List all Batch job queues in your AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of job queues to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DescribeJobQueuesCommand({
          jobQueues: undefined, // When undefined, lists all
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  jobQueues: response.jobQueues || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all Batch job queues in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
