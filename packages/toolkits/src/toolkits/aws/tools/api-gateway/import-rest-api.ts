import { tool } from 'ai';
import { z } from 'zod';
import { ImportRestApiCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsImportRestApi = tool({
  description: 'A feature of the API Gateway control service for creating a new API from an external API definition file. Use it to import a definition.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    body: z.string().describe('The POST request body containing external API definitions'),
    failOnWarnings: z.boolean().optional().describe('A query parameter to indicate whether to rollback the API creation'),
    parameters: z.record(z.any()).optional().describe('A key-value map of specified tags'),
  }),
  execute: async ({ awsCredentials, region, body, failOnWarnings, parameters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new ImportRestApiCommand({
          body: Buffer.from(body),
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
      return { error: 'Failed to a feature of the API Gateway control service for creating a new API from an external API definition file', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
