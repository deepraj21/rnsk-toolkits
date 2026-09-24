import { tool } from 'ai';
import { z } from 'zod';
import { DeletePipelineCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDeleteSagemakerPipeline = tool({
  description: 'Delete a SageMaker pipeline. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
  }),
  execute: async ({ awsCredentials, region, pipelineName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new DeletePipelineCommand({
          PipelineName: pipelineName,
      });
      await client.send(command);
      return {
                  message: 'Pipeline deleted successfully',
                  pipelineName: pipelineName,
              };
    } catch (err) {
      return { error: 'Failed to delete a SageMaker pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
