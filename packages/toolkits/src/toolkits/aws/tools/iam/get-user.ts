import { tool } from 'ai';
import { z } from 'zod';
import { GetUserCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsGetIamUser = tool({
  description: 'Get detailed information about a specific IAM user.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    userName: z.string().optional().describe('Name of the IAM user to retrieve'),
  }),
  execute: async ({ awsCredentials, region, userName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new GetUserCommand({
          UserName: userName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about a specific IAM user', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
