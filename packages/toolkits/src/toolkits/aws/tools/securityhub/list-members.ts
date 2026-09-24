import { tool } from 'ai';
import { z } from 'zod';
import { ListMembersCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsListMembers = tool({
  description: 'List Security Hub member accounts. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    onlyAssociated: z.boolean().optional().describe('Only include associated members'),
    maxResults: z.number().optional().describe('Maximum number of members to return (1-50)'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, onlyAssociated, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new ListMembersCommand({
          OnlyAssociated: onlyAssociated,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list Security Hub member accounts', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
