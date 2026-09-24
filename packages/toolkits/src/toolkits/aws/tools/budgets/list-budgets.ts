import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBudgetsCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsListBudgets = tool({
  description: 'List all budgets in your AWS account. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    maxResults: z.number().optional().describe('Maximum number of budgets to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, accountId, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new DescribeBudgetsCommand({
          AccountId: accountId,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  budgets: response.Budgets?.map((budget: any) => ({
                      budgetName: budget.BudgetName,
                      budgetLimit: budget.BudgetLimit,
                      calculatedSpend: budget.CalculatedSpend,
                      timeUnit: budget.TimeUnit,
                      timePeriod: budget.TimePeriod,
                      budgetType: budget.BudgetType,
                      lastUpdatedTime: budget.LastUpdatedTime,
                  })) || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all budgets in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
