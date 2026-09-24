import { tool } from 'ai';
import { z } from 'zod';
import { DescribeRepositoriesCommand, PutImageScanningConfigurationCommand, PutImageTagMutabilityCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsUpdateEcrRepository = tool({
  description: 'Update an existing ECR repository. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageTagMutability: z.enum(['MUTABLE', 'IMMUTABLE']).optional().describe('The tag mutability setting (MUTABLE, IMMUTABLE)'),
    imageScanningConfiguration: z.record(z.any()).optional().describe('The image scanning configuration'),
    encryptionConfiguration: z.record(z.any()).optional().describe('The encryption configuration for the repository'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageTagMutability, imageScanningConfiguration, encryptionConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      // Update repository by updating individual components
      // Note: ECR doesn't have a direct UpdateRepositoryCommand, so we update components separately
      
      if (imageTagMutability) {
        await client.send(new PutImageTagMutabilityCommand({
          repositoryName,
          registryId,
          imageTagMutability: imageTagMutability as 'MUTABLE' | 'IMMUTABLE',
        }));
      }
      if (imageScanningConfiguration) {
        await client.send(new PutImageScanningConfigurationCommand({
          repositoryName,
          registryId,
          imageScanningConfiguration,
        }));
      }
      
      // Get updated repository info
      const describeCommand = new DescribeRepositoriesCommand({
          repositoryNames: [repositoryName],
          registryId: registryId,
      });
      const response = await client.send(describeCommand);
      const repository = response.repositories?.[0];
      
      return {
                  repository: repository ? {
                      repositoryName: repository.repositoryName,
                      repositoryArn: repository.repositoryArn,
                      registryId: repository.registryId,
                      repositoryUri: repository.repositoryUri,
                      createdAt: repository.createdAt,
                      imageTagMutability: repository.imageTagMutability,
                      imageScanningConfiguration: repository.imageScanningConfiguration,
                      encryptionConfiguration: repository.encryptionConfiguration,
                  } : null,
              };
    } catch (err) {
      return { error: 'Failed to update an existing ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
