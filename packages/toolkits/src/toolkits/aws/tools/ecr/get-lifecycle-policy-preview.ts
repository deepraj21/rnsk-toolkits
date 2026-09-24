import { tool } from 'ai';
import { z } from 'zod';
import { GetLifecyclePolicyPreviewCommand } from '@aws-sdk/client-ecr';
import { createEcrClient } from '../client.js';

export const awsGetLifecyclePolicyPreview = tool({
  description: 'Get the results of a lifecycle policy preview. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    repositoryName: z.string().describe('The name of the repository'),
    registryId: z.string().optional().describe('AWS account ID associated with the registry'),
    imageIds: z.array(z.record(z.any())).optional().describe('List of image IDs to filter the preview results'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    filter: z.record(z.any()).optional().describe('Filter parameters for the preview'),
  }),
  execute: async ({ awsCredentials, region, repositoryName, registryId, imageIds, nextToken, maxResults, filter }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcrClient(awsCredentials, region);

      const command = new GetLifecyclePolicyPreviewCommand({
          repositoryName: repositoryName,
          registryId: registryId,
          imageIds: imageIds,
          nextToken: nextToken,
          maxResults: maxResults,
          filter: filter,
      });
      const response = await client.send(command);
      return {
                  registryId: response.registryId,
                  repositoryName: response.repositoryName,
                  lifecyclePolicyText: response.lifecyclePolicyText,
                  status: response.status,
                  summary: response.summary,
                  previewResults: response.previewResults,
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to get the results of a lifecycle policy preview', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
