import { tool } from 'ai';
import { z } from 'zod';
import { ListFargateProfilesCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsListEksFargateProfiles = tool({
  description: 'List all Fargate profiles in an EKS cluster. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    maxResults: z.number().optional().describe('Maximum number of profiles to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, clusterName, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new ListFargateProfilesCommand({
          clusterName: clusterName,
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  fargateProfileNames: response.fargateProfileNames || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all Fargate profiles in an EKS cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
