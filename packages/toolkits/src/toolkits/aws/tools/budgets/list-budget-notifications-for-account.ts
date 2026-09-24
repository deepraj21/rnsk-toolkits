import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBudgetNotificationsForAccountCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsListBudgetNotificationsForAccount = tool({
  description: 'List all notifications for an account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    maxResults: z.number().optional().describe('Maximum number of notifications to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, accountId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new DescribeBudgetNotificationsForAccountCommand({
          AccountId: accountId,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  notifications: (response as any).BudgetNotifications || (response as any).Notifications || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all notifications for an account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
