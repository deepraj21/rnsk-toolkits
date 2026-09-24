import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBranchCommand } from '@aws-sdk/client-amplify';
import { createAmplifyClient } from '../client.js';

export const awsDeleteAmplifyBranch = tool({
  description: 'Deletes a branch for an Amplify app. Use it to permanently remove the resource.',
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

      const command = new DeleteBranchCommand({
          appId,
          branchName,
      });
      const response = await client.send(command);
      return {
                  branch: response.branch,
              };
    } catch (err) {
      return { error: 'Failed to deletes a branch for an Amplify app', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
