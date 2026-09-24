import { tool } from 'ai';
import { z } from 'zod';
import { GetRestApisCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsListRestApis = tool({
  description: 'Lists the RestApis resources for your collection. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    position: z.string().optional().describe('The current pagination position in the paged result set'),
    limit: z.number().optional().describe('The maximum number of returned results per page'),
  }),
  execute: async ({ awsCredentials, region, position, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new GetRestApisCommand({
          position: position,
          limit: limit,
      });
      const response = await client.send(command);
      return {
                  items: response.items || [],
                  position: response.position,
              };
    } catch (err) {
      return { error: 'Failed to lists the RestApis resources for your collection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
