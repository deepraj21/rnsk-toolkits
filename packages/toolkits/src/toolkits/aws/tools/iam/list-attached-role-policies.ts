import { tool } from 'ai';
import { z } from 'zod';
import { ListAttachedRolePoliciesCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsListAttachedRolePolicies = tool({
  description: 'List all managed policies attached to an IAM role.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    roleName: z.string().describe('Name of the IAM role'),
    maxItems: z.number().optional().describe('Maximum number of policies to return'),
    marker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, roleName, maxItems, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new ListAttachedRolePoliciesCommand({
          RoleName: roleName,
          MaxItems: maxItems,
          Marker: marker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all managed policies attached to an IAM role', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
