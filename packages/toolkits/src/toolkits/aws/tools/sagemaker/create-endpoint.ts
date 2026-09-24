import { tool } from 'ai';
import { z } from 'zod';
import { CreateEndpointCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerEndpoint = tool({
  description: 'Create a SageMaker endpoint. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    endpointName: z.string().describe('Name of the endpoint'),
    endpointConfigName: z.string().describe('Name of the endpoint configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    deploymentConfig: z.record(z.any()).optional().describe('Deployment configuration'),
  }),
  execute: async ({ awsCredentials, region, endpointName, endpointConfigName, tags, deploymentConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateEndpointCommand({
          EndpointName: endpointName,
          EndpointConfigName: endpointConfigName,
          Tags: tags,
          DeploymentConfig: deploymentConfig,
      } as any);
      const response = await client.send(command);
      return {
                  endpointArn: response.EndpointArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
