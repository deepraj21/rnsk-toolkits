import { tool } from 'ai';
import { z } from 'zod';
import { GetIntegrationCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsGetIntegration = tool({
  description: 'Get the Integration. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    resourceId: z.string().describe('Specifies a get integration request\'s resource identifier'),
    httpMethod: z.string().describe('Specifies a get integration request\'s HTTP method'),
  }),
  execute: async ({ awsCredentials, region, restApiId, resourceId, httpMethod }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new GetIntegrationCommand({
          restApiId: restApiId,
          resourceId: resourceId,
          httpMethod: httpMethod,
      });
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
      return { error: 'Failed to get the Integration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
