import { tool } from 'ai';
import { z } from 'zod';
import { DeleteIntegrationCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsDeleteIntegration = tool({
  description: 'Represents a delete integration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    resourceId: z.string().describe('Specifies a delete integration request\'s resource identifier'),
    httpMethod: z.string().describe('Specifies a delete integration request\'s HTTP method'),
  }),
  execute: async ({ awsCredentials, region, restApiId, resourceId, httpMethod }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new DeleteIntegrationCommand({
          restApiId: restApiId,
          resourceId: resourceId,
          httpMethod: httpMethod,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to represents a delete integration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
