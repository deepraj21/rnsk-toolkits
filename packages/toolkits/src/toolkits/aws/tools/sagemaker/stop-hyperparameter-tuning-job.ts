import { tool } from 'ai';
import { z } from 'zod';
import { StopHyperParameterTuningJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsStopSagemakerHyperparameterTuningJob = tool({
  description: 'Stop a SageMaker hyperparameter tuning job. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hyperParameterTuningJobName: z.string().describe('Name of the hyperparameter tuning job'),
  }),
  execute: async ({ awsCredentials, region, hyperParameterTuningJobName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new StopHyperParameterTuningJobCommand({
          HyperParameterTuningJobName: hyperParameterTuningJobName,
      });
      await client.send(command);
      return {
                  message: 'Hyperparameter tuning job stopped successfully',
                  hyperParameterTuningJobName: hyperParameterTuningJobName,
              };
    } catch (err) {
      return { error: 'Failed to stop a SageMaker hyperparameter tuning job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
