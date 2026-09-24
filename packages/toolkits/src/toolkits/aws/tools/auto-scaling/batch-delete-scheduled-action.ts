import { tool } from 'ai';
import { z } from 'zod';
import { BatchDeleteScheduledActionCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsBatchDeleteAutoscalingScheduledAction = tool({
  description: 'Batch delete scheduled actions. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    scheduledActionNames: z.array(z.string()).describe('Scheduled action names to delete'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, scheduledActionNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new BatchDeleteScheduledActionCommand({
          AutoScalingGroupName: autoScalingGroupName,
          ScheduledActionNames: scheduledActionNames,
      });
      const response = await client.send(command);
      return {
                  failedScheduledActions: response.FailedScheduledActions,
              };
    } catch (err) {
      return { error: 'Failed to batch delete scheduled actions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
