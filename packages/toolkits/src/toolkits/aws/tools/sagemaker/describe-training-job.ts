import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTrainingJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerTrainingJob = tool({
  description: 'Get details about a SageMaker training job. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    trainingJobName: z.string().describe('Name of the training job'),
  }),
  execute: async ({ awsCredentials, region, trainingJobName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new DescribeTrainingJobCommand({
          TrainingJobName: trainingJobName,
      });
      const response = await client.send(command);
      return {
                  trainingJob: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker training job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
