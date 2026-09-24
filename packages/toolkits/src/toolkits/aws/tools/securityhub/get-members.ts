import { tool } from 'ai';
import { z } from 'zod';
import { GetMembersCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsGetMembers = tool({
  description: 'Get detailed information about specific member accounts. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountIds: z.array(z.string()).describe('AWS account IDs to retrieve'),
  }),
  execute: async ({ awsCredentials, region, accountIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new GetMembersCommand({
          AccountIds: accountIds,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about specific member accounts', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
