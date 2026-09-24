import { tool } from 'ai';
import { z } from 'zod';
import { CreateDeploymentCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsCreateDeployment = tool({
  description: 'Creates a Deployment resource. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    stageName: z.string().optional().describe('The name of the Stage resource for the Deployment resource'),
    stageDescription: z.string().optional().describe('The description of the Stage resource for the Deployment resource'),
    description: z.string().optional().describe('The description for the Deployment resource'),
    cacheClusterEnabled: z.boolean().optional().describe('Enables a cache cluster for the Stage resource'),
    cacheClusterSize: z.string().optional().describe('The stage\'s cache cluster size'),
    variables: z.record(z.any()).optional().describe('A map that defines the stage variables for the Stage resource'),
    canarySettings: z.record(z.any()).optional().describe('The input configuration for the canary deployment'),
    tracingEnabled: z.boolean().optional().describe('Specifies whether active tracing with X-ray is enabled'),
  }),
  execute: async ({ awsCredentials, region, restApiId, stageName, stageDescription, description, cacheClusterEnabled, cacheClusterSize, variables, canarySettings, tracingEnabled }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new CreateDeploymentCommand({
          restApiId: restApiId,
          stageName: stageName,
          stageDescription: stageDescription,
          description: description,
          cacheClusterEnabled: cacheClusterEnabled,
          cacheClusterSize: cacheClusterSize,
          variables: variables,
          canarySettings: canarySettings,
          tracingEnabled: tracingEnabled,
      } as any);
      const response = await client.send(command);
      return {
                  id: response.id,
                  description: response.description,
                  createdDate: response.createdDate,
                  apiSummary: response.apiSummary,
              };
    } catch (err) {
      return { error: 'Failed to creates a Deployment resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
