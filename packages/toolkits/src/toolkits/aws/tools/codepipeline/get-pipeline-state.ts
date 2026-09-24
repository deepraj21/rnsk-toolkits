import { tool } from 'ai';
import { z } from 'zod';
import { GetPipelineStateCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsGetCodepipelinePipelineState = tool({
  description: 'Get the current state of a CodePipeline pipeline. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the pipeline'),
  }),
  execute: async ({ awsCredentials, region, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new GetPipelineStateCommand({
          name: name,
      });
      const response = await client.send(command);
      return {
                  pipelineName: response.pipelineName,
                  pipelineVersion: response.pipelineVersion,
                  stageStates: response.stageStates || [],
                  created: response.created,
                  updated: response.updated,
              };
    } catch (err) {
      return { error: 'Failed to get the current state of a CodePipeline pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
