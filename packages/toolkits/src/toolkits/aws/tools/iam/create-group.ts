import { tool } from 'ai';
import { z } from 'zod';
import { CreateGroupCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsCreateIamGroup = tool({
  description: 'Create a new IAM group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().describe('Name of the group to create'),
    path: z.string().optional().describe('Path for the group'),
  }),
  execute: async ({ awsCredentials, region, groupName, path }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new CreateGroupCommand({
          GroupName: groupName,
          Path: path,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a new IAM group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
