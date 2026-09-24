import { tool } from 'ai';
import { z } from 'zod';
import { DeleteLifecycleHookCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDeleteAutoscalingLifecycleHook = tool({
  description: 'Delete a lifecycle hook. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    lifecycleHookName: z.string().describe('The name of the lifecycle hook'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
  }),
  execute: async ({ awsCredentials, region, lifecycleHookName, autoScalingGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DeleteLifecycleHookCommand({
          LifecycleHookName: lifecycleHookName,
          AutoScalingGroupName: autoScalingGroupName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Lifecycle hook ${lifecycleHookName} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a lifecycle hook', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
