import { tool } from 'ai';
import { z } from 'zod';
import { DescribeImageReplicationStatusCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsDescribeImageReplicationStatus = tool({
  description: 'Get the replication status of an image. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    imageId: z.record(z.any()).describe('The image ID to get replication status for'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, imageId, registryId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new DescribeImageReplicationStatusCommand({
          repositoryName: repositoryName,
          imageId: imageId,
          registryId: registryId,
      });
      const response = await client.send(command);
      return {
                  repositoryName: response.repositoryName,
                  imageId: response.imageId,
                  replicationStatuses: response.replicationStatuses,
              };
    } catch (err) {
      return { error: 'Failed to get the replication status of an image', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
