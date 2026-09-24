import { tool } from 'ai';
import { z } from 'zod';
import { UpdateCapacityProviderCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsUpdateEcsCapacityProvider = tool({
  description: 'Update a capacity provider. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the capacity provider'),
    autoScalingGroupProvider: z.record(z.any()).optional().describe('Auto Scaling group provider configuration'),
  }),
  execute: async ({ awsCredentials, region, name, autoScalingGroupProvider }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new UpdateCapacityProviderCommand({
          name: name,
          autoScalingGroupProvider: autoScalingGroupProvider,
      });
      const response = await client.send(command);
      return {
                  capacityProvider: response.capacityProvider,
              };
    } catch (err) {
      return { error: 'Failed to update a capacity provider', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
