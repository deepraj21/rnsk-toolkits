import { tool } from 'ai';
import { z } from 'zod';
import { DeleteEndpointCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDeleteSagemakerEndpoint = tool({
  description: 'Delete a SageMaker endpoint. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    endpointName: z.string().describe('Name of the endpoint'),
  }),
  execute: async ({ awsCredentials, region, endpointName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new DeleteEndpointCommand({
          EndpointName: endpointName,
      });
      await client.send(command);
      return {
                  message: 'Endpoint deleted successfully',
                  endpointName: endpointName,
              };
    } catch (err) {
      return { error: 'Failed to delete a SageMaker endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
