import { tool } from 'ai';
import { z } from 'zod';
import { CreateTrainingJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerTrainingJob = tool({
  description: 'Create a SageMaker training job. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    trainingJobName: z.string().describe('Name of the training job'),
    hyperParameters: z.record(z.any()).optional().describe('Hyperparameters'),
    algorithmSpecification: z.record(z.any()).describe('Algorithm specification'),
    roleArn: z.string().describe('IAM role ARN'),
    inputDataConfig: z.array(z.record(z.any())).describe('Input data configuration'),
    outputDataConfig: z.record(z.any()).describe('Output data configuration'),
    resourceConfig: z.record(z.any()).describe('Resource configuration'),
    vpcConfig: z.record(z.any()).optional().describe('VPC configuration'),
    stoppingCondition: z.record(z.any()).optional().describe('Stopping condition'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    enableNetworkIsolation: z.boolean().optional().describe('Enable network isolation'),
    enableInterContainerTrafficEncryption: z.boolean().optional().describe('Enable inter-container traffic encryption'),
    enableManagedSpotTraining: z.boolean().optional().describe('Enable managed spot training'),
    checkpointConfig: z.record(z.any()).optional().describe('Checkpoint configuration'),
    debugHookConfig: z.record(z.any()).optional().describe('Debug hook configuration'),
    debugRuleConfigurations: z.array(z.record(z.any())).optional().describe('Debug rule configurations'),
    tensorBoardOutputConfig: z.record(z.any()).optional().describe('TensorBoard output configuration'),
    experimentConfig: z.record(z.any()).optional().describe('Experiment configuration'),
    profilerConfig: z.record(z.any()).optional().describe('Profiler configuration'),
    profilerRuleConfigurations: z.array(z.record(z.any())).optional().describe('Profiler rule configurations'),
    environment: z.record(z.any()).optional().describe('Environment variables'),
    retryStrategy: z.record(z.any()).optional().describe('Retry strategy'),
  }),
  execute: async ({ awsCredentials, region, trainingJobName, hyperParameters, algorithmSpecification, roleArn, inputDataConfig, outputDataConfig, resourceConfig, vpcConfig, stoppingCondition, tags, enableNetworkIsolation, enableInterContainerTrafficEncryption, enableManagedSpotTraining, checkpointConfig, debugHookConfig, debugRuleConfigurations, tensorBoardOutputConfig, experimentConfig, profilerConfig, profilerRuleConfigurations, environment, retryStrategy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateTrainingJobCommand({
          TrainingJobName: trainingJobName,
          HyperParameters: hyperParameters,
          AlgorithmSpecification: algorithmSpecification,
          RoleArn: roleArn,
          InputDataConfig: inputDataConfig,
          OutputDataConfig: outputDataConfig,
          ResourceConfig: resourceConfig,
          VpcConfig: vpcConfig,
          StoppingCondition: stoppingCondition,
          Tags: tags,
          EnableNetworkIsolation: enableNetworkIsolation,
          EnableInterContainerTrafficEncryption: enableInterContainerTrafficEncryption,
          EnableManagedSpotTraining: enableManagedSpotTraining,
          CheckpointConfig: checkpointConfig,
          DebugHookConfig: debugHookConfig,
          DebugRuleConfigurations: debugRuleConfigurations,
          TensorBoardOutputConfig: tensorBoardOutputConfig,
          ExperimentConfig: experimentConfig,
          ProfilerConfig: profilerConfig,
          ProfilerRuleConfigurations: profilerRuleConfigurations,
          Environment: environment,
          RetryStrategy: retryStrategy,
      } as any);
      const response = await client.send(command);
      return {
                  trainingJobArn: response.TrainingJobArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker training job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
