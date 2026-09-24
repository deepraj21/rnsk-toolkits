import { tool } from 'ai';
import { z } from 'zod';
import { CreateModelCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerModel = tool({
  description: 'Create a SageMaker model. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    modelName: z.string().describe('Name of the model'),
    primaryContainer: z.record(z.any()).optional().describe('Primary container configuration'),
    containers: z.array(z.record(z.any())).optional().describe('Container configurations'),
    executionRoleArn: z.string().describe('IAM execution role ARN'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    vpcConfig: z.record(z.any()).optional().describe('VPC configuration'),
    enableNetworkIsolation: z.boolean().optional().describe('Enable network isolation'),
    inferenceExecutionConfig: z.record(z.any()).optional().describe('Inference execution configuration'),
  }),
  execute: async ({ awsCredentials, region, modelName, primaryContainer, containers, executionRoleArn, tags, vpcConfig, enableNetworkIsolation, inferenceExecutionConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateModelCommand({
          ModelName: modelName,
          PrimaryContainer: primaryContainer,
          Containers: containers,
          ExecutionRoleArn: executionRoleArn,
          Tags: tags,
          VpcConfig: vpcConfig,
          EnableNetworkIsolation: enableNetworkIsolation,
          InferenceExecutionConfig: inferenceExecutionConfig,
      } as any);
      const response = await client.send(command);
      return {
                  modelArn: response.ModelArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker model', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
