import { tool } from 'ai';
import { z } from 'zod';
import { PutLifecycleHookCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsPutAutoscalingLifecycleHook = tool({
  description: 'Create or update a lifecycle hook. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    lifecycleHookName: z.string().describe('The name of the lifecycle hook'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    lifecycleTransition: z.enum(['autoscaling:EC2_INSTANCE_LAUNCHING', 'autoscaling:EC2_INSTANCE_TERMINATING']).describe('Lifecycle transition'),
    roleARN: z.string().optional().describe('IAM role ARN'),
    notificationTargetARN: z.string().optional().describe('SNS topic ARN'),
    notificationMetadata: z.string().optional().describe('Notification metadata'),
    heartbeatTimeout: z.number().optional().describe('Heartbeat timeout'),
    defaultResult: z.enum(['ABANDON', 'CONTINUE']).optional().describe('Default result'),
  }),
  execute: async ({ awsCredentials, region, lifecycleHookName, autoScalingGroupName, lifecycleTransition, roleARN, notificationTargetARN, notificationMetadata, heartbeatTimeout, defaultResult }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new PutLifecycleHookCommand({
          LifecycleHookName: lifecycleHookName,
          AutoScalingGroupName: autoScalingGroupName,
          LifecycleTransition: lifecycleTransition,
          RoleARN: roleARN,
          NotificationTargetARN: notificationTargetARN,
          NotificationMetadata: notificationMetadata,
          HeartbeatTimeout: heartbeatTimeout,
          DefaultResult: defaultResult,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Lifecycle hook ${lifecycleHookName} created/updated successfully`,
              };
    } catch (err) {
      return { error: 'Failed to create or update a lifecycle hook', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
