import { tool } from 'ai';
import { z } from 'zod';
import { SetRepositoryPolicyCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsSetRepositoryPolicy = tool({
  description: 'Set the repository policy for an ECR repository. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    policyText: z.string().describe('The JSON repository policy text'),
    force: z.boolean().optional().describe('If true, set the policy even if it already exists'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, policyText, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new SetRepositoryPolicyCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          policyText: policyText,
          force: force,
      });
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  repositoryName: response.repositoryName,
                  policyText: response.policyText,
              };
    } catch (err) {
      return { error: 'Failed to set the repository policy for an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
