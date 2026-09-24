import { tool } from 'ai';
import { z } from 'zod';
import { CreateUserCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsCreateIamUser = tool({
  description: 'Create a new IAM user. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    userName: z.string().describe('Name of the IAM user to create'),
    path: z.string().optional().describe('Path for the user (e.g., /division_abc/)'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to attach to the user'),
  }),
  execute: async ({ awsCredentials, region, userName, path, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new CreateUserCommand({
          UserName: userName,
          Path: path,
          Tags: tags as any,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a new IAM user', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
