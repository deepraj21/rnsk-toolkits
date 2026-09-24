import { tool } from 'ai';
import { z } from 'zod';
import { StopTrainingJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsStopSagemakerTrainingJob = tool({
  description: 'Stop a SageMaker training job. Use it to stop a running resource (billable config may remain).',
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

      const command = new StopTrainingJobCommand({
          TrainingJobName: trainingJobName,
      });
      await client.send(command);
      return {
                  message: 'Training job stopped successfully',
                  trainingJobName: trainingJobName,
              };
    } catch (err) {
      return { error: 'Failed to stop a SageMaker training job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
