import { tool } from 'ai';
import { z } from 'zod';
import { CreateCapacityProviderCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsCreateEcsCapacityProvider = tool({
  description: 'Create a new capacity provider. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the capacity provider'),
    autoScalingGroupProvider: z.record(z.any()).optional().describe('Auto Scaling group provider configuration'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the capacity provider'),
  }),
  execute: async ({ awsCredentials, region, name, autoScalingGroupProvider, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new CreateCapacityProviderCommand({
          name: name,
          autoScalingGroupProvider: autoScalingGroupProvider,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  capacityProvider: response.capacityProvider,
              };
    } catch (err) {
      return { error: 'Failed to create a new capacity provider', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
