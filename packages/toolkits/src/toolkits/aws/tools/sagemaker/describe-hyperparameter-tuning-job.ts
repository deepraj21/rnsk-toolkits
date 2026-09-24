import { tool } from 'ai';
import { z } from 'zod';
import { DescribeHyperParameterTuningJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerHyperparameterTuningJob = tool({
  description: 'Get details about a SageMaker hyperparameter tuning job. Use it to inspect current state before making changes.',
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

      const command = new DescribeHyperParameterTuningJobCommand({
          HyperParameterTuningJobName: hyperParameterTuningJobName,
      });
      const response = await client.send(command);
      return {
                  hyperParameterTuningJob: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker hyperparameter tuning job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
