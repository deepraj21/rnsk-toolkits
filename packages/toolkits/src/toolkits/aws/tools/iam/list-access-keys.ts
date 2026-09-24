import { tool } from 'ai';
import { z } from 'zod';
import { ListAccessKeysCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsListAccessKeys = tool({
  description: 'List access keys for an IAM user. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    userName: z.string().optional().describe('Name of the IAM user (omit for current user)'),
    maxItems: z.number().optional().describe('Maximum number of keys to return'),
    marker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, userName, maxItems, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new ListAccessKeysCommand({
          UserName: userName,
          MaxItems: maxItems,
          Marker: marker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list access keys for an IAM user', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
