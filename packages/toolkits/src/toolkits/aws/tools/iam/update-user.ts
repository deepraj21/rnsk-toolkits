import { tool } from 'ai';
import { z } from 'zod';
import { UpdateUserCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsUpdateIamUser = tool({
  description: 'Update the name or path of an IAM user. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    userName: z.string().describe('Current name of the IAM user'),
    newUserName: z.string().optional().describe('New name for the IAM user'),
    newPath: z.string().optional().describe('New path for the IAM user'),
  }),
  execute: async ({ awsCredentials, region, userName, newUserName, newPath }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new UpdateUserCommand({
          UserName: userName,
          NewUserName: newUserName,
          NewPath: newPath,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update the name or path of an IAM user', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
