import { tool } from 'ai';
import { z } from 'zod';
import { CreateRestApiCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsCreateRestApi = tool({
  description: 'Creates a new RestApi resource. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the RestApi'),
    description: z.string().optional().describe('The description of the RestApi'),
    version: z.string().optional().describe('A version identifier for the API'),
    cloneFrom: z.string().optional().describe('The ID of the RestApi that you want to clone from'),
    binaryMediaTypes: z.array(z.string()).optional().describe('The list of binary media types supported by the RestApi'),
    minimumCompressionSize: z.number().optional().describe('A nullable integer that is used to enable compression'),
    apiKeySource: z.enum(['HEADER', 'AUTHORIZER']).optional().describe('The source of the API key for metering requests'),
    endpointConfiguration: z.record(z.any()).optional().describe('The endpoint configuration of this RestApi'),
    policy: z.string().optional().describe('A stringified JSON policy document'),
    tags: z.record(z.any()).optional().describe('The key-value map of strings'),
    disableExecuteApiEndpoint: z.boolean().optional().describe('Specifies whether clients can invoke your API'),
  }),
  execute: async ({ awsCredentials, region, name, description, version, cloneFrom, binaryMediaTypes, minimumCompressionSize, apiKeySource, endpointConfiguration, policy, tags, disableExecuteApiEndpoint }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new CreateRestApiCommand({
          name: name,
          description: description,
          version: version,
          cloneFrom: cloneFrom,
          binaryMediaTypes: binaryMediaTypes,
          minimumCompressionSize: minimumCompressionSize,
          apiKeySource: apiKeySource,
          endpointConfiguration: endpointConfiguration,
          policy: policy,
          tags: tags,
          disableExecuteApiEndpoint: disableExecuteApiEndpoint,
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
      return { error: 'Failed to creates a new RestApi resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
