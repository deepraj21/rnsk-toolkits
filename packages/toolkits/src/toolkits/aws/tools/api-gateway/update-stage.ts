import { tool } from 'ai';
import { z } from 'zod';
import { UpdateStageCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsUpdateStage = tool({
  description: 'Changes information about a Stage resource. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    stageName: z.string().describe('The name of the Stage resource'),
    patchOperations: z.array(z.record(z.any())).describe('A list of update operations (op, path, value, from) to apply')
  }),
  execute: async ({ awsCredentials, region, restApiId, stageName, patchOperations }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new UpdateStageCommand({
          restApiId: restApiId,
          stageName: stageName,
          patchOperations: patchOperations,
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
      return { error: 'Failed to changes information about a Stage resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
