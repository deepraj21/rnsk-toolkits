import { tool } from 'ai';
import { z } from 'zod';
import { CreateTransformJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerTransformJob = tool({
  description: 'Create a SageMaker transform job. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    transformJobName: z.string().describe('Name of the transform job'),
    modelName: z.string().describe('Name of the model'),
    maxConcurrentTransforms: z.number().optional().describe('Maximum concurrent transforms'),
    maxPayloadInMB: z.number().optional().describe('Maximum payload in MB'),
    batchStrategy: z.enum(['MultiRecord', 'SingleRecord']).optional().describe('Batch strategy'),
    environment: z.record(z.any()).optional().describe('Environment variables'),
    transformInput: z.record(z.any()).describe('Transform input configuration'),
    transformOutput: z.record(z.any()).describe('Transform output configuration'),
    dataProcessing: z.record(z.any()).optional().describe('Data processing configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    experimentConfig: z.record(z.any()).optional().describe('Experiment configuration'),
  }),
  execute: async ({ awsCredentials, region, transformJobName, modelName, maxConcurrentTransforms, maxPayloadInMB, batchStrategy, environment, transformInput, transformOutput, dataProcessing, tags, experimentConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateTransformJobCommand({
          TransformJobName: transformJobName,
          ModelName: modelName,
          MaxConcurrentTransforms: maxConcurrentTransforms,
          MaxPayloadInMB: maxPayloadInMB,
          BatchStrategy: batchStrategy,
          Environment: environment,
          TransformInput: transformInput,
          TransformOutput: transformOutput,
          DataProcessing: dataProcessing,
          Tags: tags,
          ExperimentConfig: experimentConfig,
      } as any);
      const response = await client.send(command);
      return {
                  transformJobArn: response.TransformJobArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker transform job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
