import { tool } from 'ai';
import { z } from 'zod';
import { DescribeImageScanFindingsCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsDescribeImageScanFindings = tool({
  description: 'Get the image scan findings for an ECR repository. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageId: z.record(z.any()).describe('The image ID to get scan findings for'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageId, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DescribeImageScanFindingsCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          imageId: imageId,
          nextToken: nextToken,
          maxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  repositoryName: response.repositoryName,
                  imageId: response.imageId,
                  imageScanStatus: response.imageScanStatus,
                  imageScanFindings: response.imageScanFindings,
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to get the image scan findings for an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
