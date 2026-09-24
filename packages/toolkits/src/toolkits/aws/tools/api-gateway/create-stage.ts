import { tool } from 'ai';
import { z } from 'zod';
import { CreateStageCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsCreateStage = tool({
  description: 'Creates a new Stage resource. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    stageName: z.string().describe('The name of the Stage resource'),
    deploymentId: z.string().describe('The identifier of the Deployment resource'),
    description: z.string().optional().describe('The description of the Stage resource'),
    cacheClusterEnabled: z.boolean().optional().describe('Enables a cache cluster for the Stage resource'),
    cacheClusterSize: z.string().optional().describe('The stage\'s cache cluster size'),
    variables: z.record(z.any()).optional().describe('A map that defines the stage variables for the Stage resource'),
    documentationVersion: z.string().optional().describe('The version of the associated API documentation'),
    canarySettings: z.record(z.any()).optional().describe('The canary deployment settings'),
    tracingEnabled: z.boolean().optional().describe('Specifies whether active tracing with X-ray is enabled'),
    tags: z.record(z.any()).optional().describe('The key-value map of strings'),
  }),
  execute: async ({ awsCredentials, region, restApiId, stageName, deploymentId, description, cacheClusterEnabled, cacheClusterSize, variables, documentationVersion, canarySettings, tracingEnabled, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new CreateStageCommand({
          restApiId: restApiId,
          stageName: stageName,
          deploymentId: deploymentId,
          description: description,
          cacheClusterEnabled: cacheClusterEnabled,
          cacheClusterSize: cacheClusterSize,
          variables: variables,
          documentationVersion: documentationVersion,
          canarySettings: canarySettings,
          tracingEnabled: tracingEnabled,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  deploymentId: response.deploymentId,
                  clientCertificateId: response.clientCertificateId,
                  stageName: response.stageName,
                  description: response.description,
                  cacheClusterEnabled: response.cacheClusterEnabled,
                  cacheClusterSize: response.cacheClusterSize,
                  cacheClusterStatus: response.cacheClusterStatus,
                  variables: response.variables,
                  documentationVersion: response.documentationVersion,
                  accessLogSettings: response.accessLogSettings,
                  canarySettings: response.canarySettings,
                  tracingEnabled: response.tracingEnabled,
                  webAclArn: response.webAclArn,
                  tags: response.tags,
                  createdDate: response.createdDate,
                  lastUpdatedDate: response.lastUpdatedDate,
              };
    } catch (err) {
      return { error: 'Failed to creates a new Stage resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
