import { tool } from 'ai';
import { z } from 'zod';
import { DescribeScalingActivitiesCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingActivities = tool({
  description: 'Describe scaling activities. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    activityIds: z.array(z.string()).optional().describe('Activity IDs'),
    autoScalingGroupName: z.string().optional().describe('The name of the Auto Scaling group'),
    includeDeletedGroups: z.boolean().optional().describe('Whether to include deleted groups'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, activityIds, autoScalingGroupName, includeDeletedGroups, maxRecords, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeScalingActivitiesCommand({
          ActivityIds: activityIds,
          AutoScalingGroupName: autoScalingGroupName,
          IncludeDeletedGroups: includeDeletedGroups,
          MaxRecords: maxRecords,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  activities: response.Activities,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe scaling activities', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
