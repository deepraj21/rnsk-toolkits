import { tool } from 'ai';
import { z } from 'zod';
import { BatchPutScheduledUpdateGroupActionCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsBatchPutAutoscalingScheduledAction = tool({
  description: 'Batch create or update scheduled actions. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    scheduledUpdateGroupActions: z.array(z.record(z.any())).describe('Scheduled update group actions'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, scheduledUpdateGroupActions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new BatchPutScheduledUpdateGroupActionCommand({
          AutoScalingGroupName: autoScalingGroupName,
          ScheduledUpdateGroupActions: scheduledUpdateGroupActions,
      } as any);
      const response = await client.send(command);
      return {
                  failedScheduledUpdateGroupActions: response.FailedScheduledUpdateGroupActions,
              };
    } catch (err) {
      return { error: 'Failed to batch create or update scheduled actions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
