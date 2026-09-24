import { tool } from 'ai';
import { z } from 'zod';
import { PutImageCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsPutImage = tool({
  description: 'Create or update an image in an ECR repository. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageManifest: z.string().describe('The image manifest'),
    imageManifestMediaType: z.string().optional().describe('The media type of the image manifest'),
    imageTag: z.string().optional().describe('The tag to associate with the image'),
    imageDigest: z.string().optional().describe('The image digest'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageManifest, imageManifestMediaType, imageTag, imageDigest }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new PutImageCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          imageManifest: imageManifest,
          imageManifestMediaType: imageManifestMediaType,
          imageTag: imageTag,
          imageDigest: imageDigest,
      });
      const response = await client.send(command);
      return {
                  image: response.image ? {
                      imageId: response.image.imageId,
                      imageManifest: response.image.imageManifest,
                      imageManifestMediaType: response.image.imageManifestMediaType,
                  } : null,
              };
    } catch (err) {
      return { error: 'Failed to create or update an image in an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
