import { tool } from 'ai';
import { z } from 'zod';
import { GetPipelineExecutionCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsGetCodepipelineExecution = tool({
  description: 'Get details about a pipeline execution. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
    pipelineExecutionId: z.string().describe('ID of the pipeline execution'),
  }),
  execute: async ({ awsCredentials, region, pipelineName, pipelineExecutionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new GetPipelineExecutionCommand({
          pipelineName: pipelineName,
          pipelineExecutionId: pipelineExecutionId,
      });
      const response = await client.send(command);
      return {
                  pipelineExecution: response.pipelineExecution,
              };
    } catch (err) {
      return { error: 'Failed to get details about a pipeline execution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
