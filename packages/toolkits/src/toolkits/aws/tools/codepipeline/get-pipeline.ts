import { tool } from 'ai';
import { z } from 'zod';
import { GetPipelineCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsGetCodepipelinePipeline = tool({
  description: 'Get details about a CodePipeline pipeline. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('Name of the pipeline'),
    version: z.number().optional().describe('Pipeline version'),
  }),
  execute: async ({ awsCredentials, region, name, version }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodePipelineClient(awsCredentials, region);

      const command = new GetPipelineCommand({
          name: name,
          version: version,
      });
      const response = await client.send(command);
      return {
                  pipeline: response.pipeline,
                  metadata: response.metadata,
              };
    } catch (err) {
      return { error: 'Failed to get details about a CodePipeline pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
