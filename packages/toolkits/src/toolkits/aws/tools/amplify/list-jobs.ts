import { tool } from 'ai';
import { z } from 'zod';
import { ListJobsCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsListAmplifyJobs = tool({
  description: 'Lists the jobs for a branch of an Amplify app. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    branchName: z.string().describe('The name for the branch'),
    maxResults: z.number().optional().describe('Maximum number of jobs to return'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, appId, branchName, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new ListJobsCommand({
          appId,
          branchName,
          maxResults,
          nextToken,
      });
      const response = await client.send(command);
      return {
                  jobSummaries: response.jobSummaries || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to lists the jobs for a branch of an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
