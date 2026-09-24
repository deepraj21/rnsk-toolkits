import { tool } from 'ai';
import { z } from 'zod';
import { DescribeLifecycleHooksCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingLifecycleHooks = tool({
  description: 'Describe lifecycle hooks. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    lifecycleHookNames: z.array(z.string()).optional().describe('Lifecycle hook names'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, lifecycleHookNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeLifecycleHooksCommand({
          AutoScalingGroupName: autoScalingGroupName,
          LifecycleHookNames: lifecycleHookNames,
      });
      const response = await client.send(command);
      return {
                  lifecycleHooks: response.LifecycleHooks,
              };
    } catch (err) {
      return { error: 'Failed to describe lifecycle hooks', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
