import { tool } from 'ai';
import { z } from 'zod';
import { GetJobCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsGetAmplifyJob = tool({
  description: 'Returns a job for a branch of an Amplify app. Use it to inspect current state before making changes.',
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

      const command = new GetJobCommand({
          appId,
          branchName,
          jobId,
      });
      const response = await client.send(command);
      return {
                  job: response.job,
              };
    } catch (err) {
      return { error: 'Failed to returns a job for a branch of an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
