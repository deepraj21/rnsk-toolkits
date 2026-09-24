import { tool } from 'ai';
import { z } from 'zod';
import { SetDesiredCapacityCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsSetAutoscalingGroupDesiredCapacity = tool({
  description: 'Set the desired capacity for an Auto Scaling group. Use it to change the configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    desiredCapacity: z.number().describe('Desired capacity'),
    honorCooldown: z.boolean().optional().describe('Whether to honor cooldown period'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, desiredCapacity, honorCooldown }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new SetDesiredCapacityCommand({
          AutoScalingGroupName: autoScalingGroupName,
          DesiredCapacity: desiredCapacity,
          HonorCooldown: honorCooldown,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Desired capacity set to ${desiredCapacity} for Auto Scaling group ${autoScalingGroupName}`,
              };
    } catch (err) {
      return { error: 'Failed to set the desired capacity for an Auto Scaling group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
