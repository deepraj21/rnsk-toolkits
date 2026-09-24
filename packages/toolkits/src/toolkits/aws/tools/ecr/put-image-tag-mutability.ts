import { tool } from 'ai';
import { z } from 'zod';
import { PutImageTagMutabilityCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsPutImageTagMutability = tool({
  description: 'Update the image tag mutability settings for an ECR repository. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageTagMutability: z.enum(['MUTABLE', 'IMMUTABLE']).describe('The tag mutability setting (MUTABLE, IMMUTABLE)'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageTagMutability }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new PutImageTagMutabilityCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          imageTagMutability: imageTagMutability as 'MUTABLE' | 'IMMUTABLE',
      });
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  repositoryName: response.repositoryName,
                  imageTagMutability: response.imageTagMutability,
              };
    } catch (err) {
      return { error: 'Failed to update the image tag mutability settings for an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
