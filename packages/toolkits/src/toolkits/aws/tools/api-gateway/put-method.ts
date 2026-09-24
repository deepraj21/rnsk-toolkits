import { tool } from 'ai';
import { z } from 'zod';
import { PutMethodCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsPutMethod = tool({
  description: 'Add a method to an existing Resource resource. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    resourceId: z.string().describe('The Resource resource identifier for the new Method resource'),
    httpMethod: z.string().describe('The HTTP verb for the Method resource'),
    authorizationType: z.string().describe('The method\'s authorization type'),
    authorizerId: z.string().optional().describe('The identifier of an Authorizer to use on this method'),
    apiKeyRequired: z.boolean().optional().describe('Specifies whether the method requires a valid ApiKey'),
    operationName: z.string().optional().describe('A human-friendly operation identifier for the method'),
    requestParameters: z.record(z.any()).optional().describe('A key-value map defining required or optional method request parameters'),
    requestModels: z.record(z.any()).optional().describe('Specifies the Model resources used for the request\'s content type'),
    requestValidatorId: z.string().optional().describe('The identifier of a RequestValidator for validating the method request'),
  }),
  execute: async ({ awsCredentials, region, restApiId, resourceId, httpMethod, authorizationType, authorizerId, apiKeyRequired, operationName, requestParameters, requestModels, requestValidatorId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new PutMethodCommand({
          restApiId: restApiId,
          resourceId: resourceId,
          httpMethod: httpMethod,
          authorizationType: authorizationType,
          authorizerId: authorizerId,
          apiKeyRequired: apiKeyRequired,
          operationName: operationName,
          requestParameters: requestParameters,
          requestModels: requestModels,
          requestValidatorId: requestValidatorId,
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
      return { error: 'Failed to add a method to an existing Resource resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
