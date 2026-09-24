import { tool } from 'ai';
import { z } from 'zod';
import { BatchDeleteImageCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsBatchDeleteImage = tool({
  description: 'Delete multiple images from an ECR repository. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageIds: z.array(z.record(z.any())).describe('List of image IDs to delete'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new BatchDeleteImageCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          imageIds: imageIds,
      });
      const response = await client.send(command);
      return {
                  imageIds: response.imageIds || [],
                  failures: response.failures || [],
              };
    } catch (err) {
      return { error: 'Failed to delete multiple images from an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
