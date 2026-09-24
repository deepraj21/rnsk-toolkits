import { tool } from 'ai';
import { z } from 'zod';
import { CreateBudgetActionCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsCreateBudgetAction = tool({
  description: 'Create a budget action. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    budgetName: z.string().describe('The name of the budget'),
    notificationType: z.enum(['ACTUAL', 'FORECASTED']).describe('The type of notification (ACTUAL, FORECASTED)'),
    actionType: z.enum(['APPLY_IAM_POLICY', 'APPLY_SCP_POLICY', 'RUN_SSM_DOCUMENTS']).describe('The type of action (APPLY_IAM_POLICY, APPLY_SCP_POLICY, RUN_SSM_DOCUMENTS)'),
    actionThreshold: z.record(z.any()).describe('The trigger threshold of the action'),
    definition: z.record(z.any()).describe('The definition of the action'),
    executionRoleArn: z.string().describe('The role passed for action execution'),
    approvalModel: z.enum(['AUTOMATIC', 'MANUAL']).describe('The approval model for the action (AUTOMATIC, MANUAL)'),
    subscribers: z.array(z.record(z.any())).optional().describe('A list of subscribers'),
  }),
  execute: async ({ awsCredentials, region, accountId, budgetName, notificationType, actionType, actionThreshold, definition, executionRoleArn, approvalModel, subscribers }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new CreateBudgetActionCommand({
          AccountId: accountId,
          BudgetName: budgetName,
          NotificationType: notificationType,
          ActionType: actionType,
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
                  actionId: response.ActionId,
              };
    } catch (err) {
      return { error: 'Failed to create a budget action', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
