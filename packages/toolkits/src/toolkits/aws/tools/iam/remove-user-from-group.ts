import { tool } from 'ai';
import { z } from 'zod';
import { RemoveUserFromGroupCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsRemoveUserFromGroup = tool({
  description: 'Remove an IAM user from a group. Use it to remove access or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().describe('Name of the group'),
    userName: z.string().describe('Name of the user to remove'),
  }),
  execute: async ({ awsCredentials, region, groupName, userName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new RemoveUserFromGroupCommand({
          GroupName: groupName,
          UserName: userName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to remove an IAM user from a group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
