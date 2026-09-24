import { tool } from 'ai';
import { z } from 'zod';
import { CreateSubscriberCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsCreateBudgetSubscriber = tool({
  description: 'Create a budget subscriber. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    notification: z.record(z.any()).describe('The notification object'),
    subscriber: z.record(z.any()).describe('The subscriber object containing subscriptionType and address'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, notification, subscriber }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new CreateSubscriberCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          Notification: notification,
          Subscriber: subscriber,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to create a budget subscriber', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
