import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsListCodepipelineTags = tool({
  description: 'List tags for a CodePipeline resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('ARN of the resource'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of tags to return'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          resourceArn: resourceArn,
          nextToken: nextToken,
          maxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  tags: response.tags || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list tags for a CodePipeline resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
