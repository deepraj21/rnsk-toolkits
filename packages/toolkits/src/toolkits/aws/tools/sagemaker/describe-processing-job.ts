import { tool } from 'ai';
import { z } from 'zod';
import { DescribeProcessingJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerProcessingJob = tool({
  description: 'Get details about a SageMaker processing job. Use it to inspect current state before making changes.',
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

      const command = new DescribeProcessingJobCommand({
          ProcessingJobName: processingJobName,
      });
      const response = await client.send(command);
      return {
                  processingJob: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker processing job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
