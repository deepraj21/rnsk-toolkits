import { tool } from 'ai';
import { z } from 'zod';
import { DescribeEndpointCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsDescribeSagemakerEndpoint = tool({
  description: 'Get details about a SageMaker endpoint. Use it to inspect current state before making changes.',
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

      const command = new DescribeEndpointCommand({
          EndpointName: endpointName,
      });
      const response = await client.send(command);
      return {
                  endpoint: response,
              };
    } catch (err) {
      return { error: 'Failed to get details about a SageMaker endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
