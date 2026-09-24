import { tool } from 'ai';
import { z } from 'zod';
import { DescribePipelineCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerPipeline = tool({
  description: 'Get details about a SageMaker pipeline. Use it to inspect current state before making changes.',
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

      const command = new DescribePipelineCommand({
          PipelineName: pipelineName,
      });
      const response = await client.send(command);
      return {
                  pipeline: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
