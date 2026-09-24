import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBudgetActionsForBudgetCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsListBudgetActionsForBudget = tool({
  description: 'List all budget actions for a specific budget. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    maxResults: z.number().optional().describe('Maximum number of actions to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new DescribeBudgetActionsForBudgetCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  actions: response.Actions?.map((action: any) => ({
                      actionId: action.ActionId,
                      budgetName: action.BudgetName,
                      notificationType: action.NotificationType,
                      actionType: action.ActionType,
                      actionThreshold: action.ActionThreshold,
                      status: action.Status,
                  })) || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all budget actions for a specific budget', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
