import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEndpointConfigCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerEndpointConfig = tool({
  description: 'Get details about a SageMaker endpoint configuration. Use it to inspect current state before making changes.',
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

      const command = new DescribeEndpointConfigCommand({
          EndpointConfigName: endpointConfigName,
      });
      const response = await client.send(command);
      return {
                  endpointConfig: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker endpoint configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
