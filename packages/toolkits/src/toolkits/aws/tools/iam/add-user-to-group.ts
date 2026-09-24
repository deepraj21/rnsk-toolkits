import { tool } from 'ai';
import { z } from 'zod';
import { AddUserToGroupCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsAddUserToGroup = tool({
  description: 'Add an IAM user to a group. Use it to grant access or attach configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().describe('Name of the group'),
    userName: z.string().describe('Name of the user to add'),
  }),
  execute: async ({ awsCredentials, region, groupName, userName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new AddUserToGroupCommand({
          GroupName: groupName,
          UserName: userName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to add an IAM user to a group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
