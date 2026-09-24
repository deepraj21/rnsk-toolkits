import { tool } from 'ai';
import { z } from 'zod';
import { CreateEndpointConfigCommand } from '@aws-sdk/client-sagemaker';
import { createSageMakerClient } from '../client.js';

export const awsCreateSagemakerEndpointConfig = tool({
  description: 'Create a SageMaker endpoint configuration. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    endpointConfigName: z.string().describe('Name of the endpoint configuration'),
    productionVariants: z.array(z.record(z.any())).describe('Production variants'),
    dataCaptureConfig: z.record(z.any()).optional().describe('Data capture configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption'),
    asyncInferenceConfig: z.record(z.any()).optional().describe('Async inference configuration'),
    explainerConfig: z.record(z.any()).optional().describe('Explainer configuration'),
    shadowProductionVariants: z.array(z.record(z.any())).optional().describe('Shadow production variants'),
  }),
  execute: async ({ awsCredentials, region, endpointConfigName, productionVariants, dataCaptureConfig, tags, kmsKeyId, asyncInferenceConfig, explainerConfig, shadowProductionVariants }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSageMakerClient(awsCredentials, region);

      const command = new CreateEndpointConfigCommand({
          EndpointConfigName: endpointConfigName,
          ProductionVariants: productionVariants,
          DataCaptureConfig: dataCaptureConfig,
          Tags: tags,
          KmsKeyId: kmsKeyId,
          AsyncInferenceConfig: asyncInferenceConfig,
          ExplainerConfig: explainerConfig,
          ShadowProductionVariants: shadowProductionVariants,
      } as any);
      const response = await client.send(command);
      return {
                  endpointConfigArn: response.EndpointConfigArn,
              };
    } catch (err) {
      return { error: 'Failed to create a SageMaker endpoint configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
