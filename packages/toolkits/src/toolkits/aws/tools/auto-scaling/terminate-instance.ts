import { tool } from 'ai';
import { z } from 'zod';
import { TerminateInstanceInAutoScalingGroupCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsTerminateAutoscalingInstance = tool({
  description: 'Terminate an instance in an Auto Scaling group. Use it to permanently terminate the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceId: z.string().describe('The instance ID'),
    shouldDecrementDesiredCapacity: z.boolean().optional().describe('Whether to decrement desired capacity'),
  }),
  execute: async ({ awsCredentials, region, instanceId, shouldDecrementDesiredCapacity }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new TerminateInstanceInAutoScalingGroupCommand({
          InstanceId: instanceId,
          ShouldDecrementDesiredCapacity: shouldDecrementDesiredCapacity,
      });
      const response = await client.send(command);
      return {
                  activity: response.Activity,
              };
    } catch (err) {
      return { error: 'Failed to terminate an instance in an Auto Scaling group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
