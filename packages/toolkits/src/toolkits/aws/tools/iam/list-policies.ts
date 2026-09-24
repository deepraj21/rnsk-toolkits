import { tool } from 'ai';
import { z } from 'zod';
import { ListPoliciesCommand } from '@aws-sdk/client-iam';
import { createIamClient } from '../client.js';

export const awsListIamPolicies = tool({
  description: 'List all customer managed and AWS managed policies.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    scope: z.enum(['All', 'AWS', 'Local']).optional().describe('Filter policies (All=all policies, AWS=AWS managed, Local=customer managed)'),
    onlyAttached: z.boolean().optional().describe('Filter to only attached policies'),
    maxItems: z.number().optional().describe('Maximum number of policies to return'),
    marker: z.string().optional().describe('Pagination marker'),
  }),
  execute: async ({ awsCredentials, region, scope, onlyAttached, maxItems, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createIamClient(awsCredentials, region);

      const command = new ListPoliciesCommand({
          Scope: scope,
          OnlyAttached: onlyAttached,
          MaxItems: maxItems,
          Marker: marker,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all customer managed and AWS managed policies', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
