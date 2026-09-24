import { tool } from 'ai';
import { z } from 'zod';
import { GetReservationPurchaseRecommendationCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsGetReservationPurchaseRecommendation = tool({
  description: 'Gets recommendations for which reservations to purchase. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    service: z.string().describe('The specific service that you want recommendations for'),
    accountId: z.string().optional().describe('The account ID'),
    accountScope: z.enum(['PAYER', 'LINKED']).optional().describe('The account scope'),
    lookbackPeriodInDays: z.enum(['SEVEN_DAYS', 'THIRTY_DAYS', 'SIXTY_DAYS']).optional().describe('The number of previous days to consider'),
    termInYears: z.enum(['ONE_YEAR', 'THREE_YEARS']).optional().describe('The reservation term'),
    paymentOption: z.enum(['NO_UPFRONT', 'PARTIAL_UPFRONT', 'ALL_UPFRONT', 'LIGHT_UTILIZATION', 'MEDIUM_UTILIZATION', 'HEAVY_UTILIZATION']).optional().describe('The payment option'),
    serviceSpecification: z.record(z.any()).optional().describe('The hardware specifications for the service'),
    pageSize: z.number().optional().describe('The number of recommendations to return'),
    nextPageToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, service, accountId, accountScope, lookbackPeriodInDays, termInYears, paymentOption, serviceSpecification, pageSize, nextPageToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new GetReservationPurchaseRecommendationCommand({
          Service: service,
          AccountId: accountId,
          AccountScope: accountScope,
          LookbackPeriodInDays: lookbackPeriodInDays,
          TermInYears: termInYears,
          PaymentOption: paymentOption,
          ServiceSpecification: serviceSpecification,
          PageSize: pageSize,
          NextPageToken: nextPageToken,
      });
      const response = await client.send(command);
      return {
                  metadata: response.Metadata,
                  recommendations: response.Recommendations || [],
                  nextPageToken: response.NextPageToken,
              };
    } catch (err) {
      return { error: 'Failed to gets recommendations for which reservations to purchase', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
