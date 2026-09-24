import { tool } from 'ai';
import { z } from 'zod';
import { DeleteEndpointConfigCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDeleteSagemakerEndpointConfig = tool({
  description: 'Delete a SageMaker endpoint configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    endpointConfigName: z.string().describe('Name of the endpoint configuration'),
  }),
  execute: async ({ awsCredentials, region, endpointConfigName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new DeleteEndpointConfigCommand({
          EndpointConfigName: endpointConfigName,
      });
      await client.send(command);
      return {
                  message: 'Endpoint configuration deleted successfully',
                  endpointConfigName: endpointConfigName,
              };
    } catch (err) {
      return { error: 'Failed to delete a SageMaker endpoint configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
