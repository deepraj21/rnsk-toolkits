import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRepositoriesCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsDescribeRepositories = tool({
  description: 'Get details about one or more ECR repositories. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryNames: z.array(z.string()).optional().describe('List of repository names to describe'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    maxResults: z.number().optional().describe('Maximum number of repositories to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, repositoryNames, registryId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DescribeRepositoriesCommand({
          repositoryNames: repositoryNames,
          registryId: registryId,
          maxResults: maxResults,
          nextToken: nextToken,
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
      return { error: 'Failed to get details about one or more ECR repositories', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
