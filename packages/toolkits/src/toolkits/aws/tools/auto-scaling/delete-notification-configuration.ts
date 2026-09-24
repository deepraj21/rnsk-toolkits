import { tool } from 'ai';
import { z } from 'zod';
import { DeleteNotificationConfigurationCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsDeleteAutoscalingNotificationConfiguration = tool({
  description: 'Delete a notification configuration. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    topicARN: z.string().describe('SNS topic ARN'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, topicARN }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new DeleteNotificationConfigurationCommand({
          AutoScalingGroupName: autoScalingGroupName,
          TopicARN: topicARN,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Notification configuration deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a notification configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
