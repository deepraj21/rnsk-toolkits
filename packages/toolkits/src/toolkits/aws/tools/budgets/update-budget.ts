import { tool } from 'ai';
import { z } from 'zod';
import { UpdateBudgetCommand } from '@aws-sdk/client-budgets';
import { createBudgetsClient } from '../client.js';

export const awsUpdateBudget = tool({
  description: 'Update an existing budget. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    accountId: z.string().describe('The account ID of the owner'),
    newBudget: z.record(z.any()).describe('The updated budget object'),
  }),
  execute: async ({ awsCredentials, region, accountId, newBudget }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createBudgetsClient(awsCredentials, region);

      const command = new UpdateBudgetCommand({
          AccountId: accountId,
          NewBudget: newBudget,
      } as any);
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to update an existing budget', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
