import { tool } from 'ai';
import { z } from 'zod';
import { StartPipelineExecutionCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsStartSagemakerPipelineExecution = tool({
  description: 'Start a SageMaker pipeline execution. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
    pipelineExecutionDisplayName: z.string().optional().describe('Display name of the pipeline execution'),
    pipelineParameters: z.array(z.record(z.any())).optional().describe('Pipeline parameters'),
    pipelineExecutionDescription: z.string().optional().describe('Pipeline execution description'),
    parallelismConfiguration: z.record(z.any()).optional().describe('Parallelism configuration'),
    selectiveExecutionConfig: z.record(z.any()).optional().describe('Selective execution configuration'),
  }),
  execute: async ({ awsCredentials, region, pipelineName, pipelineExecutionDisplayName, pipelineParameters, pipelineExecutionDescription, parallelismConfiguration, selectiveExecutionConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new StartPipelineExecutionCommand({
          PipelineName: pipelineName,
          PipelineExecutionDisplayName: pipelineExecutionDisplayName,
          PipelineParameters: pipelineParameters,
          PipelineExecutionDescription: pipelineExecutionDescription,
          ParallelismConfiguration: parallelismConfiguration,
          SelectiveExecutionConfig: selectiveExecutionConfig,
      } as any);
      const response = await client.send(command);
      return {
                  pipelineExecutionArn: response.PipelineExecutionArn,
              };
    } catch (err) {
      return { error: 'Failed to start a SageMaker pipeline execution', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
