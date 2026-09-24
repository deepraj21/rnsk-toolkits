import { tool } from 'ai';
import { z } from 'zod';
import { PutScheduledUpdateGroupActionCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsPutAutoscalingScheduledAction = tool({
  description: 'Create or update a scheduled action. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    scheduledActionName: z.string().describe('The name of the scheduled action'),
    time: z.string().optional().describe('Time for the action (ISO 8601)'),
    startTime: z.string().optional().describe('Start time (ISO 8601)'),
    endTime: z.string().optional().describe('End time (ISO 8601)'),
    recurrence: z.string().optional().describe('Recurrence pattern'),
    minSize: z.number().optional().describe('Minimum size'),
    maxSize: z.number().optional().describe('Maximum size'),
    desiredCapacity: z.number().optional().describe('Desired capacity'),
    timeZone: z.string().optional().describe('Time zone'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, scheduledActionName, time, startTime, endTime, recurrence, minSize, maxSize, desiredCapacity, timeZone }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new PutScheduledUpdateGroupActionCommand({
          AutoScalingGroupName: autoScalingGroupName,
          ScheduledActionName: scheduledActionName,
          Time: time ? new Date(time) : undefined,
          StartTime: startTime ? new Date(startTime) : undefined,
          EndTime: endTime ? new Date(endTime) : undefined,
          Recurrence: recurrence,
          MinSize: minSize,
          MaxSize: maxSize,
          DesiredCapacity: desiredCapacity,
          TimeZone: timeZone,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Scheduled action ${scheduledActionName} created/updated successfully`,
              };
    } catch (err) {
      return { error: 'Failed to create or update a scheduled action', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
