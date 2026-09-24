import { tool } from 'ai';
import { z } from 'zod';
import { DescribePipelineExecutionCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerPipelineExecution = tool({
  description: 'Get details about a SageMaker pipeline execution. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineExecutionArn: z.string().describe('ARN of the pipeline execution'),
  }),
  execute: async ({ awsCredentials, region, pipelineExecutionArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new DescribePipelineExecutionCommand({
          PipelineExecutionArn: pipelineExecutionArn,
      });
      const response = await client.send(command);
      return {
                  pipelineExecution: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker pipeline execution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
