import { tool } from 'ai';
import { z } from 'zod';
import { StartLifecyclePolicyPreviewCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsStartLifecyclePolicyPreview = tool({
  description: 'Start a preview of the lifecycle policy for an ECR repository. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    lifecyclePolicyText: z.string().optional().describe('The JSON repository lifecycle policy text'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, lifecyclePolicyText }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new StartLifecyclePolicyPreviewCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          lifecyclePolicyText: lifecyclePolicyText,
      });
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  repositoryName: response.repositoryName,
                  lifecyclePolicyText: response.lifecyclePolicyText,
                  status: response.status,
              };
    } catch (err) {
      return { error: 'Failed to start a preview of the lifecycle policy for an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
