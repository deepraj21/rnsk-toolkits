import { tool } from 'ai';
import { z } from 'zod';
import { PutNotificationConfigurationCommand } from '@aws-sdk/client-auto-scaling';
import { createAutoScalingClient } from '../client.js';

export const awsPutAutoscalingNotificationConfiguration = tool({
  description: 'Create or update a notification configuration. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    autoScalingGroupName: z.string().describe('The name of the Auto Scaling group'),
    topicARN: z.string().describe('SNS topic ARN'),
    notificationTypes: z.array(z.string()).describe('Notification types'),
  }),
  execute: async ({ awsCredentials, region, autoScalingGroupName, topicARN, notificationTypes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createAutoScalingClient(awsCredentials, region);

      const command = new PutNotificationConfigurationCommand({
          AutoScalingGroupName: autoScalingGroupName,
          TopicARN: topicARN,
          NotificationTypes: notificationTypes,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Notification configuration created/updated successfully`,
              };
    } catch (err) {
      return { error: 'Failed to create or update a notification configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
