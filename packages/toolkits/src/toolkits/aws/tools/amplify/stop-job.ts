import { tool } from 'ai';
import { z } from 'zod';
import { StopJobCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsStopAmplifyJob = tool({
  description: 'Stops a job that is in progress for a branch of an Amplify app. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    branchName: z.string().describe('The name for the branch'),
    jobId: z.string().describe('The unique ID for the job'),
  }),
  execute: async ({ awsCredentials, region, appId, branchName, jobId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new StopJobCommand({
          appId,
          branchName,
          jobId,
      });
      const response = await client.send(command);
      return {
                  jobSummary: response.jobSummary,
              };
    } catch (err) {
      return { error: 'Failed to stops a job that is in progress for a branch of an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
