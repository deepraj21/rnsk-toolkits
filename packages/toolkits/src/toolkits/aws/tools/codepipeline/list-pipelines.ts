import { tool } from 'ai';
import { z } from 'zod';
import { ListPipelinesCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsListCodepipelinePipelines = tool({
  description: 'List all CodePipeline pipelines. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxResults: z.number().optional().describe('Maximum number of pipelines to return'),
  }),
  execute: async ({ awsCredentials, region, nextToken, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new ListPipelinesCommand({
          nextToken: nextToken,
          maxResults: maxResults,
      });
      const response = await client.send(command);
      return {
                  pipelines: response.pipelines || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all CodePipeline pipelines', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
