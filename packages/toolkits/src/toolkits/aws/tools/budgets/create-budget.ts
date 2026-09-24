import { tool } from 'ai';
import { z } from 'zod';
import { CreateBudgetCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsCreateBudget = tool({
  description: 'Create a new budget. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budget: z.record(z.any()).describe('The budget object containing budgetName, budgetLimit, timeUnit, budgetType, etc.'),
    notificationsWithSubscribers: z.array(z.record(z.any())).optional().describe('A list of notifications that you want to associate with the budget'),
  }),
  execute: async ({ awsCredentials, region, accountId, budget, notificationsWithSubscribers }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new CreateBudgetCommand({
          AccountId: accountId,
          Budget: budget,
          NotificationsWithSubscribers: notificationsWithSubscribers,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to create a new budget', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
