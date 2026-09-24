import { tool } from 'ai';
import { z } from 'zod';
import { GetStagesCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsListStages = tool({
  description: 'Lists information about a collection of Stage resources. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    deploymentId: z.string().optional().describe('The stages\'s deployment identifier'),
  }),
  execute: async ({ awsCredentials, region, restApiId, deploymentId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new GetStagesCommand({
          restApiId: restApiId,
          deploymentId: deploymentId,
      });
      const response = await client.send(command);
      return {
                  item: response.item || [],
              };
    } catch (err) {
      return { error: 'Failed to lists information about a collection of Stage resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
