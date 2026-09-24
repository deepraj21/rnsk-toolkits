import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRepositoriesCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsListRepositories = tool({
  description: 'List all ECR repositories in your AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of repositories to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken, registryId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DescribeRepositoriesCommand({
          maxResults: maxResults,
          nextToken: nextToken,
          registryId: registryId,
      });
      const response = await client.send(command);
      return {
                  repositories: response.repositories?.map((repo: any) => ({
                      repositoryName: repo.repositoryName,
                      repositoryArn: repo.repositoryArn,
                      registryId: repo.registryId,
                      repositoryUri: repo.repositoryUri,
                      createdAt: repo.createdAt,
                      imageTagMutability: repo.imageTagMutability,
                      imageScanningConfiguration: repo.imageScanningConfiguration,
                      encryptionConfiguration: repo.encryptionConfiguration,
                  })) || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all ECR repositories in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
