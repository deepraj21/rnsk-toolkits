import { tool } from 'ai';
import { z } from 'zod';
import { UpdateSubscriberCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsUpdateBudgetSubscriber = tool({
  description: 'Update a budget subscriber. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    notification: z.record(z.any()).describe('The notification object'),
    oldSubscriber: z.record(z.any()).describe('The previous subscriber object'),
    newSubscriber: z.record(z.any()).describe('The updated subscriber object'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, notification, oldSubscriber, newSubscriber }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new UpdateSubscriberCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          Notification: notification,
          OldSubscriber: oldSubscriber,
          NewSubscriber: newSubscriber,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to update a budget subscriber', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
