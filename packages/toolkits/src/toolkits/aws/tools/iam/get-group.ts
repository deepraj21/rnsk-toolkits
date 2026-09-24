import { tool } from 'ai';
import { z } from 'zod';
import { GetGroupCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsGetIamGroup = tool({
  description: 'Get detailed information about a specific IAM group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().describe('Name of the IAM group'),
    maxItems: z.number().optional().describe('Maximum number of users in group to return'),
    marker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, groupName, maxItems, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new GetGroupCommand({
          GroupName: groupName,
          MaxItems: maxItems,
          Marker: marker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about a specific IAM group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
