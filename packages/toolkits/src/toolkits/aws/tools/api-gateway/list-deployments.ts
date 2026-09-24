import { tool } from 'ai';
import { z } from 'zod';
import { GetDeploymentsCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsListDeployments = tool({
  description: 'Lists information about a collection of Deployment resources. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    position: z.string().optional().describe('The current pagination position in the paged result set'),
    limit: z.number().optional().describe('The maximum number of returned results per page'),
  }),
  execute: async ({ awsCredentials, region, restApiId, position, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new GetDeploymentsCommand({
          restApiId: restApiId,
          position: position,
          limit: limit,
      });
      const response = await client.send(command);
      return {
                  items: response.items || [],
                  position: response.position,
              };
    } catch (err) {
      return { error: 'Failed to lists information about a collection of Deployment resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
