import { tool } from 'ai';
import { z } from 'zod';
import { UpdateBudgetActionCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsUpdateBudgetAction = tool({
  description: 'Update a budget action. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    actionId: z.string().describe('The ID of the action to update'),
    notificationType: z.enum(['ACTUAL', 'FORECASTED']).optional().describe('The type of notification (ACTUAL, FORECASTED)'),
    actionThreshold: z.record(z.any()).optional().describe('The trigger threshold of the action'),
    definition: z.record(z.any()).optional().describe('The definition of the action'),
    executionRoleArn: z.string().optional().describe('The role passed for action execution'),
    approvalModel: z.enum(['AUTOMATIC', 'MANUAL']).optional().describe('The approval model for the action (AUTOMATIC, MANUAL)'),
    subscribers: z.array(z.record(z.any())).optional().describe('A list of subscribers'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, actionId, notificationType, actionThreshold, definition, executionRoleArn, approvalModel, subscribers }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new UpdateBudgetActionCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          ActionId: actionId,
          NotificationType: notificationType,
          ActionThreshold: actionThreshold,
          Definition: definition,
          ExecutionRoleArn: executionRoleArn,
          ApprovalModel: approvalModel,
          Subscribers: subscribers,
      } as any);
      const response = await client.send(command);
      return {
                  accountId: response.AccountId,
                  budgetName: response.BudgetName,
                  oldAction: response.OldAction,
                  newAction: response.NewAction,
              };
    } catch (err) {
      return { error: 'Failed to update a budget action', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
