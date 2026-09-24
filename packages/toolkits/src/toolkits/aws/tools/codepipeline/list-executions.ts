import { tool } from 'ai';
import { z } from 'zod';
import { ListPipelineExecutionsCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsListCodepipelineExecutions = tool({
  description: 'List pipeline executions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
    maxResults: z.number().optional().describe('Maximum number of executions to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, pipelineName, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new ListPipelineExecutionsCommand({
          pipelineName: pipelineName,
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  pipelineExecutionSummaries: response.pipelineExecutionSummaries || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list pipeline executions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
