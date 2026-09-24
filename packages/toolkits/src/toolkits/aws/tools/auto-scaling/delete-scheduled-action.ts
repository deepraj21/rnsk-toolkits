import { tool } from 'ai';
import { z } from 'zod';
import { DeleteScheduledActionCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDeleteAutoscalingScheduledAction = tool({
  description: 'Delete a scheduled action. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    scheduledActionName: z.string().describe('The name of the scheduled action'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, scheduledActionName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DeleteScheduledActionCommand({
          AutoScalingGroupName: autoScalingGroupName,
          ScheduledActionName: scheduledActionName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Scheduled action ${scheduledActionName} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a scheduled action', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
