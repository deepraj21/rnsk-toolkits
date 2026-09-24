import { tool } from 'ai';
import { z } from 'zod';
import { DescribeSubscribersForNotificationCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsListSubscribersForNotification = tool({
  description: 'List all subscribers for a specific notification. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    notification: z.record(z.any()).describe('The notification object'),
    maxResults: z.number().optional().describe('Maximum number of subscribers to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, notification, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new DescribeSubscribersForNotificationCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          Notification: notification,
          MaxResults: maxResults,
          NextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  subscribers: response.Subscribers || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all subscribers for a specific notification', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
