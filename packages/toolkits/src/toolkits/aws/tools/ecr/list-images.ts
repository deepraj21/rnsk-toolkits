import { tool } from 'ai';
import { z } from 'zod';
import { ListImagesCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsListImages = tool({
  description: 'List all images in an ECR repository. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of images to return'),
    filter: z.record(z.any()).optional().describe('Filter parameters for listing images'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, nextToken, maxResults, filter }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new ListImagesCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          nextToken: nextToken,
          maxResults: maxResults,
          filter: filter,
      });
      const response = await client.send(command);
      return {
                  imageIds: response.imageIds || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all images in an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
