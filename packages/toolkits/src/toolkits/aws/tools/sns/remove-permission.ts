import { tool } from 'ai';
import { z } from 'zod';
import { RemovePermissionCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsRemoveSnsPermission = tool({
  description: 'Remove a permission from an SNS topic. Use it to remove access or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().describe('The ARN of the topic'),
    label: z.string().describe('The label of the permission to remove'),
  }),
  execute: async ({ awsCredentials, region, topicArn, label }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new RemovePermissionCommand({
          TopicArn: topicArn,
          Label: label,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Permission ${label} removed successfully from topic ${topicArn}`,
              };
    } catch (err) {
      return { error: 'Failed to remove a permission from an SNS topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
