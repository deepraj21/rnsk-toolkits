import { tool } from 'ai';
import { z } from 'zod';
import { CreateAccessKeyCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsCreateAccessKey = tool({
  description: 'Create a new access key for an IAM user. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    userName: z.string().optional().describe('Name of the IAM user (omit for current user)'),
  }),
  execute: async ({ awsCredentials, region, userName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new CreateAccessKeyCommand({
          UserName: userName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a new access key for an IAM user', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
