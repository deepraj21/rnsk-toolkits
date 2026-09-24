import { tool } from 'ai';
import { z } from 'zod';
import { ListActionExecutionsCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsListCodepipelineActionExecutions = tool({
  description: 'List action executions for a pipeline execution. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
    filter: z.record(z.any()).optional().describe('Filter criteria'),
    maxResults: z.number().optional().describe('Maximum number of executions to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, pipelineName, filter, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new ListActionExecutionsCommand({
          pipelineName: pipelineName,
          filter: filter,
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  actionExecutionDetails: response.actionExecutionDetails || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list action executions for a pipeline execution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
