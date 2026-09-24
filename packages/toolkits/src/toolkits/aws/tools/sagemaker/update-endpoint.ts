import { tool } from 'ai';
import { z } from 'zod';
import { UpdateEndpointCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsUpdateSagemakerEndpoint = tool({
  description: 'Update a SageMaker endpoint. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    endpointName: z.string().describe('Name of the endpoint'),
    endpointConfigName: z.string().describe('Name of the new endpoint configuration'),
    retainAllVariantProperties: z.boolean().optional().describe('Retain all variant properties'),
    excludeRetainedVariantProperties: z.record(z.any()).optional().describe('Exclude retained variant properties'),
    deploymentConfig: z.record(z.any()).optional().describe('Deployment configuration'),
    retainDeploymentConfig: z.boolean().optional().describe('Retain deployment configuration'),
  }),
  execute: async ({ awsCredentials, region, endpointName, endpointConfigName, retainAllVariantProperties, excludeRetainedVariantProperties, deploymentConfig, retainDeploymentConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new UpdateEndpointCommand({
          EndpointName: endpointName,
          EndpointConfigName: endpointConfigName,
          RetainAllVariantProperties: retainAllVariantProperties,
          ExcludeRetainedVariantProperties: excludeRetainedVariantProperties,
          DeploymentConfig: deploymentConfig,
          RetainDeploymentConfig: retainDeploymentConfig,
      } as any);
      const response = await client.send(command);
      return {
                  endpointArn: response.EndpointArn,
              };
    } catch (err) {
      return { error: 'Failed to update a SageMaker endpoint', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
