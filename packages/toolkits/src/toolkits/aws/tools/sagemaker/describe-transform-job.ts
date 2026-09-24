import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTransformJobCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerTransformJob = tool({
  description: 'Get details about a SageMaker transform job. Use it to inspect current state before making changes.',
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

      const command = new DescribeTransformJobCommand({
          TransformJobName: transformJobName,
      });
      const response = await client.send(command);
      return {
                  transformJob: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker transform job', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
