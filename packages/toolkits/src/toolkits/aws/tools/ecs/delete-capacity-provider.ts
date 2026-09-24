import { tool } from 'ai';
import { z } from 'zod';
import { DeleteCapacityProviderCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDeleteEcsCapacityProvider = tool({
  description: 'Delete a capacity provider. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    capacityProvider: z.string().describe('The name of the capacity provider'),
  }),
  execute: async ({ awsCredentials, region, capacityProvider }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DeleteCapacityProviderCommand({
          capacityProvider: capacityProvider,
      });
      const response = await client.send(command);
      return {
                  capacityProvider: response.capacityProvider,
              };
    } catch (err) {
      return { error: 'Failed to delete a capacity provider', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
