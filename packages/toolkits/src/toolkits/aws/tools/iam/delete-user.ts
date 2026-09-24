import { tool } from 'ai';
import { z } from 'zod';
import { DeleteUserCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsDeleteIamUser = tool({
  description: 'Delete an IAM user (user must not have any access keys, signing certificates, or MFA devices). Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    userName: z.string().describe('Name of the IAM user to delete'),
  }),
  execute: async ({ awsCredentials, region, userName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new DeleteUserCommand({
          UserName: userName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete an IAM user (user must not have any access keys, signing certificates, or MFA devices)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
