import { tool } from 'ai';
import { z } from 'zod';
import { CreateMembersCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsCreateMembers = tool({
  description: 'Invite AWS accounts to be member accounts in Security Hub. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountDetails: z.array(z.record(z.any())).describe('AWS accounts to invite'),
  }),
  execute: async ({ awsCredentials, region, accountDetails }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new CreateMembersCommand({
          AccountDetails: accountDetails,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to invite AWS accounts to be member accounts in Security Hub', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
