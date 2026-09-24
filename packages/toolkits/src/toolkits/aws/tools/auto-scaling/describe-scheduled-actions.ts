import { tool } from 'ai';
import { z } from 'zod';
import { DescribeScheduledActionsCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingScheduledActions = tool({
  description: 'Describe scheduled actions. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().optional().describe('The name of the Auto Scaling group'),
    scheduledActionNames: z.array(z.string()).optional().describe('Scheduled action names'),
    startTime: z.string().optional().describe('Start time filter (ISO 8601)'),
    endTime: z.string().optional().describe('End time filter (ISO 8601)'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, scheduledActionNames, startTime, endTime, nextToken, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeScheduledActionsCommand({
          AutoScalingGroupName: autoScalingGroupName,
          ScheduledActionNames: scheduledActionNames,
          StartTime: startTime ? new Date(startTime) : undefined,
          EndTime: endTime ? new Date(endTime) : undefined,
          NextToken: nextToken,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return {
                  scheduledUpdateGroupActions: response.ScheduledUpdateGroupActions,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe scheduled actions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
