import { tool } from 'ai';
import { z } from 'zod';
import { DeleteNotificationCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsDeleteBudgetNotification = tool({
  description: 'Delete a budget notification. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    notification: z.record(z.any()).describe('The notification object to delete'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, notification }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new DeleteNotificationCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          Notification: notification,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to delete a budget notification', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
