import { tool } from 'ai';
import { z } from 'zod';
import { GetMethodCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsGetMethod = tool({
  description: 'Describe an existing Method resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    resourceId: z.string().describe('The Resource identifier for the Method resource'),
    httpMethod: z.string().describe('The HTTP verb of the Method resource'),
  }),
  execute: async ({ awsCredentials, region, restApiId, resourceId, httpMethod }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new GetMethodCommand({
          restApiId: restApiId,
          resourceId: resourceId,
          httpMethod: httpMethod,
      });
      const response = await client.send(command);
      return {
                  httpMethod: response.httpMethod,
                  authorizationType: response.authorizationType,
                  authorizerId: response.authorizerId,
                  apiKeyRequired: response.apiKeyRequired,
                  requestValidatorId: response.requestValidatorId,
                  operationName: response.operationName,
                  requestParameters: response.requestParameters,
                  requestModels: response.requestModels,
                  methodResponses: response.methodResponses,
                  methodIntegration: response.methodIntegration,
              };
    } catch (err) {
      return { error: 'Failed to describe an existing Method resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
