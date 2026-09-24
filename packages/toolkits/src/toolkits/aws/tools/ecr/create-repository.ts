import { tool } from 'ai';
import { z } from 'zod';
import { CreateRepositoryCommand, PutLifecyclePolicyCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsCreateRepository = tool({
  description: 'Create a new ECR repository. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageTagMutability: z.enum(['MUTABLE', 'IMMUTABLE']).optional().describe('The tag mutability setting (MUTABLE, IMMUTABLE)'),
    imageScanningConfiguration: z.record(z.any()).optional().describe('The image scanning configuration'),
    encryptionConfiguration: z.record(z.any()).optional().describe('The encryption configuration for the repository'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the repository'),
    lifecyclePolicy: z.record(z.any()).optional().describe('The lifecycle policy to apply to the repository after creation'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageTagMutability, imageScanningConfiguration, encryptionConfiguration, tags, lifecyclePolicy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new CreateRepositoryCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          imageTagMutability: imageTagMutability,
          imageScanningConfiguration: imageScanningConfiguration,
          encryptionConfiguration: encryptionConfiguration as any,
          tags: tags as any,
      } as any);
      const response = await client.send(command);
      if (lifecyclePolicy) {
          await client.send(new PutLifecyclePolicyCommand({
              repositoryName: repositoryName,
              registryId: registryId,
              lifecyclePolicyText: JSON.stringify(lifecyclePolicy),
          }));
      }
      return {
                  repository: response.repository ? {
                      repositoryName: response.repository.repositoryName,
                      repositoryArn: response.repository.repositoryArn,
                      registryId: response.repository.registryId,
                      repositoryUri: response.repository.repositoryUri,
                      createdAt: response.repository.createdAt,
                      imageTagMutability: response.repository.imageTagMutability,
                      imageScanningConfiguration: response.repository.imageScanningConfiguration,
                      encryptionConfiguration: response.repository.encryptionConfiguration,
                  } : null,
              };
    } catch (err) {
      return { error: 'Failed to create a new ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
