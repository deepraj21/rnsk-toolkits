import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBudgetCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsDescribeBudget = tool({
  description: 'Get details about a specific budget. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new DescribeBudgetCommand({
          AccountId: accountId,
          BudgetName: budgetName,
      });
      const response = await client.send(command);
      return {
                  budget: response.Budget ? {
                      budgetName: response.Budget.BudgetName,
                      budgetLimit: response.Budget.BudgetLimit,
                      calculatedSpend: response.Budget.CalculatedSpend,
                      timeUnit: response.Budget.TimeUnit,
                      timePeriod: response.Budget.TimePeriod,
                      budgetType: response.Budget.BudgetType,
                      costFilters: response.Budget.CostFilters,
                      costTypes: response.Budget.CostTypes,
                      lastUpdatedTime: response.Budget.LastUpdatedTime,
                  } : null,
              };
    } catch (err) {
      return { error: 'Failed to get details about a specific budget', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
