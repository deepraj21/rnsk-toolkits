import { tool } from 'ai';
import { z } from 'zod';
import { AddPermissionCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsAddSqsPermission = tool({
  description: 'Add a permission to an SQS queue. Use it to grant access or attach configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    label: z.string().describe('Unique identifier for the permission'),
    awsAccountIds: z.array(z.string()).describe('AWS account IDs'),
    actions: z.array(z.string()).describe('Actions to allow (SendMessage, ReceiveMessage, DeleteMessage, etc.)'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, label, awsAccountIds, actions }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new AddPermissionCommand({
          QueueUrl: queueUrl,
          Label: label,
          AWSAccountIds: awsAccountIds,
          Actions: actions,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Permission added successfully to queue ${queueUrl}`,
              };
    } catch (err) {
      return { error: 'Failed to add a permission to an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
