import { tool } from 'ai';
import { z } from 'zod';
import { RemovePermissionCommand } from '@aws-sdk/client-sqs';
import { createSqsClient } from '../client.js';

export const awsRemoveSqsPermission = tool({
  description: 'Remove a permission from an SQS queue',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queueUrl: z.string().describe('The URL of the queue'),
    label: z.string().describe('The label of the permission to remove'),
  }),
  execute: async ({ awsCredentials, region, queueUrl, label }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSqsClient(awsCredentials, region);

      const command = new RemovePermissionCommand({
          QueueUrl: queueUrl,
          Label: label,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Permission ${label} removed successfully from queue ${queueUrl}`,
              };
    } catch (err) {
      return { error: 'Failed to remove a permission from an SQS queue', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
