import { tool } from 'ai';
import { z } from 'zod';
import { PutIntegrationCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsPutIntegration = tool({
  description: 'Sets up a method\'s integration. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    type: z.enum(['HTTP', 'AWS', 'MOCK', 'HTTP_PROXY', 'AWS_PROXY']).describe('Specifies a put integration input\'s type'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    resourceId: z.string().describe('Specifies a put integration request\'s resource ID'),
    httpMethod: z.string().describe('Specifies a put integration request\'s HTTP method'),
    integrationHttpMethod: z.string().optional().describe('Specifies a put integration input\'s HTTP method'),
    uri: z.string().optional().describe('Specifies Uniform Resource Identifier (URI) of the integration endpoint'),
    connectionType: z.enum(['INTERNET', 'VPC_LINK']).optional().describe('The type of the network connection to the integration endpoint'),
    connectionId: z.string().optional().describe('The ID of the VpcLink used for the integration'),
    credentials: z.string().optional().describe('Specifies whether credentials are required for a put integration'),
    requestParameters: z.record(z.any()).optional().describe('A key-value map specifying request parameters'),
    requestTemplates: z.record(z.any()).optional().describe('Represents a map of Velocity templates that are applied on the request payload'),
    passthroughBehavior: z.enum(['WHEN_NO_MATCH', 'WHEN_NO_TEMPLATES', 'NEVER']).optional().describe('Specifies the pass-through behavior for incoming requests'),
    cacheNamespace: z.string().optional().describe('Specifies a put integration input\'s cache namespace'),
    cacheKeyParameters: z.array(z.string()).optional().describe('Specifies a put integration input\'s cache key parameters'),
    contentHandling: z.enum(['CONVERT_TO_BINARY', 'CONVERT_TO_TEXT']).optional().describe('Specifies how to handle request payload content type conversions'),
    timeoutInMillis: z.number().optional().describe('Custom timeout between 50 and 29,000 milliseconds'),
  }),
  execute: async ({ awsCredentials, region, restApiId, resourceId, httpMethod, integrationHttpMethod, uri, connectionType, connectionId, credentials, requestParameters, requestTemplates, passthroughBehavior, cacheNamespace, cacheKeyParameters, contentHandling, timeoutInMillis, type }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new PutIntegrationCommand({
          restApiId: restApiId,
          resourceId: resourceId,
          httpMethod: httpMethod,
          type: type,
          integrationHttpMethod: integrationHttpMethod,
          uri: uri,
          connectionType: connectionType,
          connectionId: connectionId,
          credentials: credentials,
          requestParameters: requestParameters,
          requestTemplates: requestTemplates,
          passthroughBehavior: passthroughBehavior,
          cacheNamespace: cacheNamespace,
          cacheKeyParameters: cacheKeyParameters,
          contentHandling: contentHandling,
          timeoutInMillis: timeoutInMillis,
      } as any);
      const response = await client.send(command);
      return {
                  type: response.type,
                  httpMethod: response.httpMethod,
                  uri: response.uri,
                  connectionType: response.connectionType,
                  connectionId: response.connectionId,
                  credentials: response.credentials,
                  requestParameters: response.requestParameters,
                  requestTemplates: response.requestTemplates,
                  passthroughBehavior: response.passthroughBehavior,
                  contentHandling: response.contentHandling,
                  timeoutInMillis: response.timeoutInMillis,
                  cacheNamespace: response.cacheNamespace,
                  cacheKeyParameters: response.cacheKeyParameters,
                  integrationResponses: response.integrationResponses,
              };
    } catch (err) {
      return { error: 'Failed to sets up a method\'s integration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
