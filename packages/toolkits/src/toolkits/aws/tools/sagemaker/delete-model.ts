import { tool } from 'ai';
import { z } from 'zod';
import { DeleteModelCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDeleteSagemakerModel = tool({
  description: 'Delete a SageMaker model. Use it to permanently remove the resource.',
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

      const command = new DeleteModelCommand({
          ModelName: modelName,
      });
      await client.send(command);
      return {
                  message: 'Model deleted successfully',
                  modelName: modelName,
              };
    } catch (err) {
      return { error: 'Failed to delete a SageMaker model', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
