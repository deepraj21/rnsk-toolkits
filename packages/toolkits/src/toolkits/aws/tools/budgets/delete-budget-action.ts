import { tool } from 'ai';
import { z } from 'zod';
import { DeleteBudgetActionCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsDeleteBudgetAction = tool({
  description: 'Delete a budget action. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    actionId: z.string().describe('The ID of the action to delete'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, actionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new DeleteBudgetActionCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          ActionId: actionId,
      });
      const response = await client.send(command);
      return {
                  accountId: response.AccountId,
                  budgetName: response.BudgetName,
                  action: response.Action,
              };
    } catch (err) {
      return { error: 'Failed to delete a budget action', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
