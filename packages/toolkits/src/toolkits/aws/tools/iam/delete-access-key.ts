import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAccessKeyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsDeleteAccessKey = tool({
  description: 'Delete an access key for an IAM user. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accessKeyId: z.string().describe('Access key ID to delete'),
    userName: z.string().optional().describe('Name of the IAM user (omit for current user)'),
  }),
  execute: async ({ awsCredentials, region, accessKeyId, userName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new DeleteAccessKeyCommand({
          AccessKeyId: accessKeyId,
          UserName: userName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete an access key for an IAM user', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
