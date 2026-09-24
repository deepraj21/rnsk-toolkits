import { tool } from 'ai';
import { z } from 'zod';
import { DescribeJobsCommand } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsDescribeBatchJobs = tool({
  description: 'Get details about one or more Batch jobs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobs: z.array(z.string()).describe('List of job IDs to describe'),
  }),
  execute: async ({ awsCredentials, region, jobs }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new DescribeJobsCommand({
          jobs: jobs,
      });
      const response = await client.send(command);
      return {
                  jobs: response.jobs || [],
              };
    } catch (err) {
      return { error: 'Failed to get details about one or more Batch jobs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
