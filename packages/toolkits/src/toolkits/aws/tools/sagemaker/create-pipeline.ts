import { tool } from 'ai';
import { z } from 'zod';
import { CreatePipelineCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerPipeline = tool({
  description: 'Create a SageMaker pipeline. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    pipelineName: z.string().describe('Name of the pipeline'),
    pipelineDisplayName: z.string().optional().describe('Display name of the pipeline'),
    pipelineDefinition: z.string().optional().describe('Pipeline definition (JSON string)'),
    pipelineDefinitionS3Location: z.record(z.any()).optional().describe('S3 location of pipeline definition'),
    pipelineDescription: z.string().optional().describe('Pipeline description'),
    roleArn: z.string().describe('IAM role ARN'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    parallelismConfiguration: z.record(z.any()).optional().describe('Parallelism configuration'),
  }),
  execute: async ({ awsCredentials, region, pipelineName, pipelineDisplayName, pipelineDefinition, pipelineDefinitionS3Location, pipelineDescription, roleArn, tags, parallelismConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreatePipelineCommand({
          PipelineName: pipelineName,
          PipelineDisplayName: pipelineDisplayName,
          PipelineDefinition: pipelineDefinition,
          PipelineDefinitionS3Location: pipelineDefinitionS3Location,
          PipelineDescription: pipelineDescription,
          RoleArn: roleArn,
          Tags: tags,
          ParallelismConfiguration: parallelismConfiguration,
      } as any);
      const response = await client.send(command);
      return {
                  pipelineArn: response.PipelineArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker pipeline', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
