import { tool } from 'ai';
import { z } from 'zod';
import { GetBranchCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsGetAmplifyBranch = tool({
  description: 'Retrieves a branch for an Amplify app. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    appId: z.string().describe('The unique ID for an Amplify app'),
    branchName: z.string().describe('The name for the branch'),
  }),
  execute: async ({ awsCredentials, region, appId, branchName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAmplifyClient(awsCredentials, region);

      const command = new GetBranchCommand({
          appId,
          branchName,
      });
      const response = await client.send(command);
      return {
                  branch: response.branch,
              };
    } catch (err) {
      return { error: 'Failed to retrieves a branch for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
