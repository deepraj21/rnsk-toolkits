import { tool } from 'ai';
import { z } from 'zod';
import { GetSavingsPlansPurchaseRecommendationCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetSavingsPlansPurchaseRecommendation = tool({
  description: 'Gets recommendations for which Savings Plans to purchase. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    savingsPlansType: z.enum(['COMPUTE_SP', 'EC2_INSTANCE_SP', 'SAGEMAKER_SP']).describe('The Savings Plans recommendation type'),
    termInYears: z.enum(['ONE_YEAR', 'THREE_YEARS']).describe('The Savings Plans term'),
    paymentOption: z.enum(['NO_UPFRONT', 'PARTIAL_UPFRONT', 'ALL_UPFRONT']).describe('The payment option'),
    accountScope: z.enum(['PAYER', 'LINKED']).optional().describe('The account scope'),
    lookbackPeriodInDays: z.enum(['SEVEN_DAYS', 'THIRTY_DAYS', 'SIXTY_DAYS']).optional().describe('The number of previous days to consider'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
    pageSize: z.number().optional().describe('The number of recommendations to return'),
  }),
  execute: async ({ awsCredentials, region, savingsPlansType, termInYears, paymentOption, accountScope, lookbackPeriodInDays, nextPageToken, pageSize }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetSavingsPlansPurchaseRecommendationCommand({
          SavingsPlansType: savingsPlansType,
          TermInYears: termInYears,
          PaymentOption: paymentOption,
          AccountScope: accountScope,
          LookbackPeriodInDays: lookbackPeriodInDays,
          NextPageToken: nextPageToken,
          PageSize: pageSize,
      });
      const response = await client.send(command);
      return {
                  metadata: response.Metadata,
                  savingsPlansPurchaseRecommendation: response.SavingsPlansPurchaseRecommendation,
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to gets recommendations for which Savings Plans to purchase', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
