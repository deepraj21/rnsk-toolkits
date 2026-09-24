import { tool } from 'ai';
import { z } from 'zod';
import { CreatePipelineCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsCreateCodepipelinePipeline = tool({
  description: 'Create a new CodePipeline pipeline. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipeline: z.record(z.any()).describe('Pipeline structure'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, pipeline, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new CreatePipelineCommand({
          pipeline: pipeline,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  pipeline: response.pipeline,
                  tags: response.tags,
              };
    } catch (err) {
      return { error: 'Failed to create a new CodePipeline pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
