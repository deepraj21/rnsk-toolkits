import { tool } from 'ai';
import { z } from 'zod';
import { PutRestApiCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsPutRestApi = tool({
  description: 'A feature of the API Gateway control service for updating an existing API with an external API definition file. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    body: z.string().describe('The PUT request body containing external API definitions'),
    mode: z.enum(['merge', 'overwrite']).optional().describe('The mode query parameter to specify the update mode'),
    failOnWarnings: z.boolean().optional().describe('A query parameter to indicate whether to rollback the API update'),
    parameters: z.record(z.any()).optional().describe('Custom header parameters'),
  }),
  execute: async ({ awsCredentials, region, restApiId, body, mode, failOnWarnings, parameters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new PutRestApiCommand({
          restApiId: restApiId,
          body: Buffer.from(body),
          mode: mode,
          failOnWarnings: failOnWarnings,
          parameters: parameters,
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
      return { error: 'Failed to a feature of the API Gateway control service for updating an existing API with an external API definition file', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
