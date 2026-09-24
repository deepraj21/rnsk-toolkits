import { tool } from 'ai';
import { z } from 'zod';
import { UpdatePipelineCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsUpdateCodepipelinePipeline = tool({
  description: 'Update a CodePipeline pipeline. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipeline: z.record(z.any()).describe('Updated pipeline structure'),
  }),
  execute: async ({ awsCredentials, region, pipeline }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new UpdatePipelineCommand({
          pipeline: pipeline,
      } as any);
      const response = await client.send(command);
      return {
                  pipeline: response.pipeline,
              };
    } catch (err) {
      return { error: 'Failed to update a CodePipeline pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
