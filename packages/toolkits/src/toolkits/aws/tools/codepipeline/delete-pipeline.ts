import { tool } from 'ai';
import { z } from 'zod';
import { DeletePipelineCommand } from '@aws-sdk/client-codepipeline';
import { createCodePipelineClient } from '../client.js';

export const awsDeleteCodepipelinePipeline = tool({
  description: 'Delete a CodePipeline pipeline. Use it to permanently remove the resource.',
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

      const command = new DeletePipelineCommand({
          name: name,
      });
      await client.send(command);
      return {
                  message: 'Pipeline deleted successfully',
                  name: name,
              };
    } catch (err) {
      return { error: 'Failed to delete a CodePipeline pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
