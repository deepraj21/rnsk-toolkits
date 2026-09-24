import { tool } from 'ai';
import { z } from 'zod';
import { DeleteGroupCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsDeleteIamGroup = tool({
  description: 'Delete an IAM group (group must not contain any users). Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().describe('Name of the group to delete'),
  }),
  execute: async ({ awsCredentials, region, groupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new DeleteGroupCommand({
          GroupName: groupName,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete an IAM group (group must not contain any users)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
