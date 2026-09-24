import { tool } from 'ai';
import { z } from 'zod';
import { UpdateNotificationCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsUpdateBudgetNotification = tool({
  description: 'Update a budget notification. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    oldNotification: z.record(z.any()).describe('The previous notification object'),
    newNotification: z.record(z.any()).describe('The updated notification object'),
    subscribers: z.array(z.record(z.any())).optional().describe('A list of subscribers'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, oldNotification, newNotification, subscribers }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new UpdateNotificationCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          OldNotification: oldNotification,
          NewNotification: newNotification,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to update a budget notification', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
