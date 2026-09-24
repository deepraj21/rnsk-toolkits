import { tool } from 'ai';
import { z } from 'zod';
import { StopPipelineExecutionCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsStopCodepipelineExecution = tool({
  description: 'Stop a pipeline execution. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
    pipelineExecutionId: z.string().describe('ID of the pipeline execution'),
    abandon: z.boolean().optional().describe('Whether to abandon the execution'),
    reason: z.string().optional().describe('Reason for stopping'),
  }),
  execute: async ({ awsCredentials, region, pipelineName, pipelineExecutionId, abandon, reason }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new StopPipelineExecutionCommand({
          pipelineName: pipelineName,
          pipelineExecutionId: pipelineExecutionId,
          abandon: abandon,
          reason: reason,
      });
      const response = await client.send(command);
      return {
                  pipelineExecutionId: response.pipelineExecutionId,
              };
    } catch (err) {
      return { error: 'Failed to stop a pipeline execution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
