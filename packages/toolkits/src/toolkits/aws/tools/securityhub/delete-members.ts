import { tool } from 'ai';
import { z } from 'zod';
import { DeleteMembersCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsDeleteMembers = tool({
  description: 'Remove member accounts from Security Hub. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountIds: z.array(z.string()).describe('AWS account IDs to remove'),
  }),
  execute: async ({ awsCredentials, region, accountIds }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new DeleteMembersCommand({
          AccountIds: accountIds,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to remove member accounts from Security Hub', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
