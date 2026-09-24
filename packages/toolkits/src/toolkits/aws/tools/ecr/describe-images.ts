import { tool } from 'ai';
import { z } from 'zod';
import { DescribeImagesCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsDescribeImages = tool({
  description: 'Get details about images in an ECR repository. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageIds: z.array(z.record(z.any())).optional().describe('List of image IDs to describe'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of images to return'),
    filter: z.record(z.any()).optional().describe('Filter parameters for describing images'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageIds, nextToken, maxResults, filter }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DescribeImagesCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          imageIds: imageIds,
          nextToken: nextToken,
          maxResults: maxResults,
          filter: filter,
      });
      const response = await client.send(command);
      return {
                  imageDetails: response.imageDetails?.map((img: any) => ({
                      imageDigest: img.imageDigest,
                      imageTags: img.imageTags,
                      imagePushedAt: img.imagePushedAt,
                      imageSizeInBytes: img.imageSizeInBytes,
                      imageManifestMediaType: img.imageManifestMediaType,
                      artifactMediaType: img.artifactMediaType,
                      lastRecordedPullTime: img.lastRecordedPullTime,
                  })) || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to get details about images in an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
