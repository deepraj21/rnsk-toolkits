import { tool } from 'ai';
import { z } from 'zod';
import { ExitStandbyCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsExitStandbyAutoscalingGroup = tool({
  description: 'Move instances out of standby mode. Use it to move instances.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceIds: z.array(z.string()).optional().describe('Instance IDs to move out of standby'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
  }),
  execute: async ({ awsCredentials, region, instanceIds, autoScalingGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new ExitStandbyCommand({
          InstanceIds: instanceIds,
          AutoScalingGroupName: autoScalingGroupName,
      });
      const response = await client.send(command);
      return {
                  activities: response.Activities,
              };
    } catch (err) {
      return { error: 'Failed to move instances out of standby mode', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
