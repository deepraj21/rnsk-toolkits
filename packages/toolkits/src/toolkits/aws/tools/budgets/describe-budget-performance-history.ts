import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBudgetPerformanceHistoryCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsDescribeBudgetPerformanceHistory = tool({
  description: 'Get the performance history of a budget. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    timePeriod: z.record(z.any()).optional().describe('The time period for the budget performance history'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, timePeriod, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new DescribeBudgetPerformanceHistoryCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          TimePeriod: timePeriod,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  budgetPerformanceHistory: response.BudgetPerformanceHistory,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to get the performance history of a budget', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
