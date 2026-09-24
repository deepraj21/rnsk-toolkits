import { tool } from 'ai';
import { z } from 'zod';
import { CreateHyperParameterTuningJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerHyperparameterTuningJob = tool({
  description: 'Create a SageMaker hyperparameter tuning job. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hyperParameterTuningJobName: z.string().describe('Name of the hyperparameter tuning job'),
    hyperParameterTuningJobConfig: z.record(z.any()).describe('Hyperparameter tuning job configuration'),
    trainingJobDefinition: z.record(z.any()).optional().describe('Training job definition'),
    trainingJobDefinitions: z.array(z.record(z.any())).optional().describe('Training job definitions'),
    warmStartConfig: z.record(z.any()).optional().describe('Warm start configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, hyperParameterTuningJobName, hyperParameterTuningJobConfig, trainingJobDefinition, trainingJobDefinitions, warmStartConfig, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateHyperParameterTuningJobCommand({
          HyperParameterTuningJobName: hyperParameterTuningJobName,
          HyperParameterTuningJobConfig: hyperParameterTuningJobConfig,
          TrainingJobDefinition: trainingJobDefinition,
          TrainingJobDefinitions: trainingJobDefinitions,
          WarmStartConfig: warmStartConfig,
          Tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  hyperParameterTuningJobArn: response.HyperParameterTuningJobArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker hyperparameter tuning job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
