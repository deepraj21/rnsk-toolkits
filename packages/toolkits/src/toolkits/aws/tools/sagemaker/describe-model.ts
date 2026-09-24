import { tool } from 'ai';
import { z } from 'zod';
import { DescribeModelCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerModel = tool({
  description: 'Get details about a SageMaker model. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    modelName: z.string().describe('Name of the model'),
  }),
  execute: async ({ awsCredentials, region, modelName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new DescribeModelCommand({
          ModelName: modelName,
      });
      const response = await client.send(command);
      return {
                  model: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker model', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
