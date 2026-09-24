import { tool } from 'ai';
import { z } from 'zod';
import { RecordLifecycleActionHeartbeatCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsRecordAutoscalingLifecycleActionHeartbeat = tool({
  description: 'Record a lifecycle action heartbeat',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    lifecycleHookName: z.string().describe('The name of the lifecycle hook'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    lifecycleActionToken: z.string().describe('Lifecycle action token'),
    instanceId: z.string().optional().describe('Instance ID'),
  }),
  execute: async ({ awsCredentials, region, lifecycleHookName, autoScalingGroupName, lifecycleActionToken, instanceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new RecordLifecycleActionHeartbeatCommand({
          LifecycleHookName: lifecycleHookName,
          AutoScalingGroupName: autoScalingGroupName,
          LifecycleActionToken: lifecycleActionToken,
          InstanceId: instanceId,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Lifecycle action heartbeat recorded successfully`,
              };
    } catch (err) {
      return { error: 'Failed to record a lifecycle action heartbeat', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
