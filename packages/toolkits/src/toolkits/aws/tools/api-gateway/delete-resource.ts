import { tool } from 'ai';
import { z } from 'zod';
import { DeleteResourceCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsDeleteResource = tool({
  description: 'Deletes a Resource resource. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    resourceId: z.string().describe('The identifier for the Resource resource'),
  }),
  execute: async ({ awsCredentials, region, restApiId, resourceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new DeleteResourceCommand({
          restApiId: restApiId,
          resourceId: resourceId,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes a Resource resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
