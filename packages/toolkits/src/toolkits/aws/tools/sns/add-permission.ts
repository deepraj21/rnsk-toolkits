import { tool } from 'ai';
import { z } from 'zod';
import { AddPermissionCommand } from '@aws-sdk/client-sns';
import { createSnsClient } from '../client.js';

export const awsAddSnsPermission = tool({
  description: 'Add a permission to an SNS topic. Use it to grant access or attach configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    topicArn: z.string().describe('The ARN of the topic'),
    label: z.string().describe('Unique identifier for the permission'),
    awsAccountId: z.array(z.string()).describe('AWS account IDs'),
    actionName: z.array(z.string()).describe('Actions to allow'),
  }),
  execute: async ({ awsCredentials, region, topicArn, label, awsAccountId, actionName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSnsClient(awsCredentials, region);

      const command = new AddPermissionCommand({
          TopicArn: topicArn,
          Label: label,
          AWSAccountId: awsAccountId,
          ActionName: actionName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Permission added successfully to topic ${topicArn}`,
              };
    } catch (err) {
      return { error: 'Failed to add a permission to an SNS topic', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
