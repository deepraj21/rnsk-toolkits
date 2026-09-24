import { tool } from 'ai';
import { z } from 'zod';
import { CreateProcessingJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerProcessingJob = tool({
  description: 'Create a SageMaker processing job. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    processingInputs: z.array(z.record(z.any())).optional().describe('Processing inputs'),
    processingOutputConfig: z.record(z.any()).optional().describe('Processing output configuration'),
    processingJobName: z.string().describe('Name of the processing job'),
    processingResources: z.record(z.any()).describe('Processing resources'),
    stoppingCondition: z.record(z.any()).optional().describe('Stopping condition'),
    appSpecification: z.record(z.any()).describe('App specification'),
    environment: z.record(z.any()).optional().describe('Environment variables'),
    networkConfig: z.record(z.any()).optional().describe('Network configuration'),
    roleArn: z.string().describe('IAM role ARN'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    experimentConfig: z.record(z.any()).optional().describe('Experiment configuration'),
  }),
  execute: async ({ awsCredentials, region, processingInputs, processingOutputConfig, processingJobName, processingResources, stoppingCondition, appSpecification, environment, networkConfig, roleArn, tags, experimentConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateProcessingJobCommand({
          ProcessingInputs: processingInputs,
          ProcessingOutputConfig: processingOutputConfig,
          ProcessingJobName: processingJobName,
          ProcessingResources: processingResources,
          StoppingCondition: stoppingCondition,
          AppSpecification: appSpecification,
          Environment: environment,
          NetworkConfig: networkConfig,
          RoleArn: roleArn,
          Tags: tags,
          ExperimentConfig: experimentConfig,
      } as any);
      const response = await client.send(command);
      return {
                  processingJobArn: response.ProcessingJobArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker processing job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
