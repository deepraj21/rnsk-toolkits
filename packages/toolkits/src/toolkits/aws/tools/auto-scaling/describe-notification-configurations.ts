import { tool } from 'ai';
import { z } from 'zod';
import { DescribeNotificationConfigurationsCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDescribeAutoscalingNotificationConfigurations = tool({
  description: 'Describe notification configurations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupNames: z.array(z.string()).optional().describe('Auto Scaling group names'),
    nextToken: z.string().optional().describe('Token for pagination'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupNames, nextToken, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DescribeNotificationConfigurationsCommand({
          AutoScalingGroupNames: autoScalingGroupNames,
          NextToken: nextToken,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return {
                  notificationConfigurations: response.NotificationConfigurations,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to describe notification configurations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
