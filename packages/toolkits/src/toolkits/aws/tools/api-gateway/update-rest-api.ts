import { tool } from 'ai';
import { z } from 'zod';
import { UpdateRestApiCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsUpdateRestApi = tool({
  description: 'Changes information about the specified API. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    patchOperations: z.array(z.record(z.any())).describe('A list of update operations (op, path, value, from) to apply')
  }),
  execute: async ({ awsCredentials, region, restApiId, patchOperations }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new UpdateRestApiCommand({
          restApiId: restApiId,
          patchOperations: patchOperations,
      } as any);
      const response = await client.send(command);
      return {
                  id: response.id,
                  name: response.name,
                  description: response.description,
                  createdDate: response.createdDate,
                  version: response.version,
                  warnings: response.warnings,
                  binaryMediaTypes: response.binaryMediaTypes,
                  minimumCompressionSize: response.minimumCompressionSize,
                  apiKeySource: response.apiKeySource,
                  endpointConfiguration: response.endpointConfiguration,
                  policy: response.policy,
                  tags: response.tags,
                  disableExecuteApiEndpoint: response.disableExecuteApiEndpoint,
              };
    } catch (err) {
      return { error: 'Failed to changes information about the specified API', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
