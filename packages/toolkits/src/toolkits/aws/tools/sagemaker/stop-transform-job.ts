import { tool } from 'ai';
import { z } from 'zod';
import { StopTransformJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsStopSagemakerTransformJob = tool({
  description: 'Stop a SageMaker transform job. Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    transformJobName: z.string().describe('Name of the transform job'),
  }),
  execute: async ({ awsCredentials, region, transformJobName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new StopTransformJobCommand({
          TransformJobName: transformJobName,
      });
      await client.send(command);
      return {
                  message: 'Transform job stopped successfully',
                  transformJobName: transformJobName,
              };
    } catch (err) {
      return { error: 'Failed to stop a SageMaker transform job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
