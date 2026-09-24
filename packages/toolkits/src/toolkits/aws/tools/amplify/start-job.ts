import { tool } from 'ai';
import { z } from 'zod';
import { StartJobCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsStartAmplifyJob = tool({
  description: 'Starts a new job for a branch of an Amplify app. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    branchName: z.string().describe('The name for the branch'),
    jobType: z.enum(['RELEASE', 'RETRY', 'MANUAL', 'WEB_HOOK']).describe('Describes the type for the job'),
    jobId: z.string().optional().describe('The unique ID for an existing job'),
    jobReason: z.string().optional().describe('A descriptive reason for starting this job'),
    commitId: z.string().optional().describe('The commit ID from a third-party repository provider for the job'),
    commitMessage: z.string().optional().describe('The commit message from a third-party repository provider for the job'),
    commitTime: z.string().optional().describe('The commit date and time for the job'),
  }),
  execute: async ({ awsCredentials, region, appId, branchName, jobType, jobId, jobReason, commitId, commitMessage, commitTime }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new StartJobCommand({
          appId: appId,
          branchName: branchName,
          jobType: jobType as any,
          jobId: jobId,
          jobReason: jobReason,
          commitId: commitId,
          commitMessage: commitMessage,
          commitTime: commitTime ? new Date(commitTime) : undefined,
      });
      const response = await client.send(command);
      return {
                  jobSummary: response.jobSummary,
              };
    } catch (err) {
      return { error: 'Failed to starts a new job for a branch of an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
