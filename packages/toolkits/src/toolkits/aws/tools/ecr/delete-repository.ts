import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRepositoryCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsDeleteRepository = tool({
  description: 'Delete an ECR repository. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository to delete'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    force: z.boolean().optional().describe('If true, force delete the repository even if it contains images'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DeleteRepositoryCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          force: force,
      });
      const response = await client.send(command);
      return {
                  repository: response.repository ? {
                      repositoryName: response.repository.repositoryName,
                      repositoryArn: response.repository.repositoryArn,
                      registryId: response.repository.registryId,
                      repositoryUri: response.repository.repositoryUri,
                      createdAt: response.repository.createdAt,
                  } : null,
              };
    } catch (err) {
      return { error: 'Failed to delete an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
