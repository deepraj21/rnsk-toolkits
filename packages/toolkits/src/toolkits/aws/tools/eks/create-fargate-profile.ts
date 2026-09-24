import { tool } from 'ai';
import { z } from 'zod';
import { CreateFargateProfileCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsCreateEksFargateProfile = tool({
  description: 'Create a new Fargate profile. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fargateProfileName: z.string().describe('The name of the Fargate profile'),
    clusterName: z.string().describe('The name of the cluster'),
    podExecutionRoleArn: z.string().describe('IAM role ARN for pod execution'),
    subnets: z.array(z.string()).optional().describe('Subnet IDs'),
    selectors: z.array(z.record(z.any())).optional().describe('Pod selectors'),
    tags: z.record(z.any()).optional().describe('Tags to apply to the profile'),
    clientRequestToken: z.string().optional().describe('Unique identifier for the request'),
  }),
  execute: async ({ awsCredentials, region, fargateProfileName, clusterName, podExecutionRoleArn, subnets, selectors, tags, clientRequestToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new CreateFargateProfileCommand({
          fargateProfileName: fargateProfileName,
          clusterName: clusterName,
          podExecutionRoleArn: podExecutionRoleArn,
          subnets: subnets,
          selectors: selectors,
          tags: tags,
          clientRequestToken: clientRequestToken,
      });
      const response = await client.send(command);
      return {
                  fargateProfile: response.fargateProfile,
              };
    } catch (err) {
      return { error: 'Failed to create a new Fargate profile', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
