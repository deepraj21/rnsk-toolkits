import { tool } from 'ai';
import { z } from 'zod';
import { EnterStandbyCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsEnterStandbyAutoscalingGroup = tool({
  description: 'Move instances into standby mode. Use it to move instances.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceIds: z.array(z.string()).optional().describe('Instance IDs to move to standby'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    shouldDecrementDesiredCapacity: z.boolean().optional().describe('Whether to decrement desired capacity'),
  }),
  execute: async ({ awsCredentials, region, instanceIds, autoScalingGroupName, shouldDecrementDesiredCapacity }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new EnterStandbyCommand({
          InstanceIds: instanceIds,
          AutoScalingGroupName: autoScalingGroupName,
          ShouldDecrementDesiredCapacity: shouldDecrementDesiredCapacity,
      });
      const response = await client.send(command);
      return {
                  activities: response.Activities,
              };
    } catch (err) {
      return { error: 'Failed to move instances into standby mode', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
