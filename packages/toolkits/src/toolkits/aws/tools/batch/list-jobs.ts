import { tool } from 'ai';
import { z } from 'zod';
import { ListJobsCommand, JobStatus } from '@aws-sdk/client-batch';
import { createBatchClient } from '../client.js';

export const awsListBatchJobs = tool({
  description: 'List Batch jobs in a job queue. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    jobQueue: z.string().describe('The name of the job queue'),
    jobStatus: z.enum(['SUBMITTED', 'PENDING', 'RUNNABLE', 'STARTING', 'RUNNING', 'SUCCEEDED', 'FAILED']).optional().describe('Filter by job status (SUBMITTED, PENDING, RUNNABLE, STARTING, RUNNING, SUCCEEDED, FAILED)'),
    maxResults: z.number().optional().describe('Maximum number of jobs to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    filters: z.array(z.record(z.any())).optional().describe('Additional filters'),
  }),
  execute: async ({ awsCredentials, region, jobQueue, jobStatus, maxResults, nextToken, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBatchClient(awsCredentials, region);

      const command = new ListJobsCommand({
          jobQueue: jobQueue,
          jobStatus: jobStatus as JobStatus | undefined,
          maxResults: maxResults,
          nextToken: nextToken,
          filters: filters,
      });
      const response = await client.send(command);
      return {
                  jobSummaryList: response.jobSummaryList || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list Batch jobs in a job queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
