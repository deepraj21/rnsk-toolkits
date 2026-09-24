import { tool } from 'ai';
import { z } from 'zod';
import { PutImageScanningConfigurationCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsPutImageScanningConfiguration = tool({
  description: 'Update the image scanning configuration for an ECR repository. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageScanningConfiguration: z.record(z.any()).describe('The image scanning configuration'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageScanningConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new PutImageScanningConfigurationCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          imageScanningConfiguration: imageScanningConfiguration,
      });
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  repositoryName: response.repositoryName,
                  imageScanningConfiguration: response.imageScanningConfiguration,
              };
    } catch (err) {
      return { error: 'Failed to update the image scanning configuration for an ECR repository', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
