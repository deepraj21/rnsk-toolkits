import { tool } from 'ai';
import { z } from 'zod';
import { ExecuteBudgetActionCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsExecuteBudgetAction = tool({
  description: 'Execute a budget action. Use it to run an operation.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    actionId: z.string().describe('The ID of the action to execute'),
    executionType: z.enum(['APPROVE_BUDGET_ACTION', 'RETRY_BUDGET_ACTION', 'REVERSE_BUDGET_ACTION']).describe('The type of execution (APPROVE_BUDGET_ACTION, RETRY_BUDGET_ACTION, REVERSE_BUDGET_ACTION)'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, actionId, executionType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new ExecuteBudgetActionCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          ActionId: actionId,
          ExecutionType: executionType,
      });
      const response = await client.send(command);
      return {
                  accountId: response.AccountId,
                  budgetName: response.BudgetName,
                  actionId: response.ActionId,
                  executionType: response.ExecutionType,
              };
    } catch (err) {
      return { error: 'Failed to execute a budget action', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
