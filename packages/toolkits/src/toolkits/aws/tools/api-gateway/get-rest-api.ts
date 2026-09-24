import { tool } from 'ai';
import { z } from 'zod';
import { GetRestApiCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsGetRestApi = tool({
  description: 'Lists the RestApi resource in the collection. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
  }),
  execute: async ({ awsCredentials, region, restApiId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new GetRestApiCommand({
          restApiId: restApiId,
      });
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
      return { error: 'Failed to lists the RestApi resource in the collection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
