import { tool } from 'ai';
import { z } from 'zod';
import { StopProcessingJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsStopSagemakerProcessingJob = tool({
  description: 'Stop a SageMaker processing job. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    processingJobName: z.string().describe('Name of the processing job'),
  }),
  execute: async ({ awsCredentials, region, processingJobName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new StopProcessingJobCommand({
          ProcessingJobName: processingJobName,
      });
      await client.send(command);
      return {
                  message: 'Processing job stopped successfully',
                  processingJobName: processingJobName,
              };
    } catch (err) {
      return { error: 'Failed to stop a SageMaker processing job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
