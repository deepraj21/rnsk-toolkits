// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paypalRequest, failedResult, toPayPalError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const paypalListTransactions = tool({
  description:
    'List account transactions in a time range (GET /v1/reporting/transactions). startDate and endDate are ISO 8601 UTC.',
  inputSchema: z.object({
    paypalCredentials: credField,
    startDate: z.string().describe('Start time ISO 8601, e.g. 2024-01-01T00:00:00Z'),
    endDate: z.string().describe('End time ISO 8601'),
    transactionId: z.string().optional(),
    transactionType: z.string().optional(),
    transactionStatus: z.string().optional(),
    page: z.number().int().optional(),
    pageSize: z.number().int().max(500).optional(),
    fields: z.string().optional().describe('Comma-separated transaction fields'),
  }),
  execute: async ({
    paypalCredentials,
    startDate,
    endDate,
    transactionId,
    transactionType,
    transactionStatus,
    page,
    pageSize,
    fields,
  }) => {
    try {
      const result = await paypalRequest(paypalCredentials, '/v1/reporting/transactions', {
        query: {
          start_date: startDate,
          end_date: endDate,
          transaction_id: transactionId,
          transaction_type: transactionType,
          transaction_status: transactionStatus,
          page,
          page_size: pageSize,
          fields,
        },
      });
      if (!result.ok) return failedResult('Failed to list transactions', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error listing transactions');
    }
  },
});
