import { tool } from 'ai';
import { z } from 'zod';
import { DeleteFargateProfileCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDeleteEksFargateProfile = tool({
  description: 'Delete a Fargate profile. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    fargateProfileName: z.string().describe('The name of the Fargate profile to delete'),
  }),
  execute: async ({ awsCredentials, region, clusterName, fargateProfileName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DeleteFargateProfileCommand({
          clusterName: clusterName,
          fargateProfileName: fargateProfileName,
      });
      const response = await client.send(command);
      return {
                  fargateProfile: response.fargateProfile,
              };
    } catch (err) {
      return { error: 'Failed to delete a Fargate profile', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
