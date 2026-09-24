import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRepositoriesCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsGetImageTagMutability = tool({
  description: 'Get the image tag mutability settings for an ECR repository. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DescribeRepositoriesCommand({
          repositoryNames: [repositoryName],
          registryId: registryId,
      });
      const response = await client.send(command);
      const repository = response.repositories?.[0];
      return {
                  registryId: repository?.registryId,
                  repositoryName: repository?.repositoryName,
                  imageTagMutability: repository?.imageTagMutability,
              };
    } catch (err) {
      return { error: 'Failed to get the image tag mutability settings for an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
