import { tool } from 'ai';
import { z } from 'zod';
import { CompleteLifecycleActionCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsCompleteAutoscalingLifecycleAction = tool({
  description: 'Complete a lifecycle action',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    lifecycleHookName: z.string().describe('The name of the lifecycle hook'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    lifecycleActionToken: z.string().describe('Lifecycle action token'),
    lifecycleActionResult: z.enum(['ABANDON', 'CONTINUE']).optional().describe('Lifecycle action result'),
    instanceId: z.string().optional().describe('Instance ID'),
  }),
  execute: async ({ awsCredentials, region, lifecycleHookName, autoScalingGroupName, lifecycleActionToken, lifecycleActionResult, instanceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new CompleteLifecycleActionCommand({
          LifecycleHookName: lifecycleHookName,
          AutoScalingGroupName: autoScalingGroupName,
          LifecycleActionToken: lifecycleActionToken,
          LifecycleActionResult: lifecycleActionResult,
          InstanceId: instanceId,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Lifecycle action completed successfully`,
              };
    } catch (err) {
      return { error: 'Failed to complete a lifecycle action', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
