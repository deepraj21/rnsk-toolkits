import { tool } from 'ai';
import { z } from 'zod';
import { PutLifecyclePolicyCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsPutLifecyclePolicy = tool({
  description: 'Create or update the lifecycle policy for an ECR repository. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    lifecyclePolicyText: z.string().describe('The JSON repository lifecycle policy text'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, lifecyclePolicyText }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new PutLifecyclePolicyCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          lifecyclePolicyText: lifecyclePolicyText,
      });
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  repositoryName: response.repositoryName,
                  lifecyclePolicyText: response.lifecyclePolicyText,
              };
    } catch (err) {
      return { error: 'Failed to create or update the lifecycle policy for an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
