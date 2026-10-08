// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paypalRequest, failedResult, toPayPalError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const paypalCreatePayout = tool({
  description:
    'Create a batch payout (POST /v1/payments/payouts). Requires sender_batch_header and items array.',
  inputSchema: z.object({
    paypalCredentials: credField,
    senderBatchHeader: z.record(z.any()).describe('sender_batch_id, email_subject, etc.'),
    items: z.array(z.record(z.any())).min(1).describe('Payout items with recipient and amount'),
  }),
  execute: async ({ paypalCredentials, senderBatchHeader, items }) => {
    try {
      const result = await paypalRequest(paypalCredentials, '/v1/payments/payouts', {
        method: 'POST',
        body: {
          sender_batch_header: senderBatchHeader,
          items,
        },
      });
      if (!result.ok) return failedResult('Failed to create payout', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error creating payout');
    }
  },
});

export const paypalGetPayoutBatch = tool({
  description: 'Get payout batch status (GET /v1/payments/payouts/{payoutBatchId}).',
  inputSchema: z.object({
    paypalCredentials: credField,
    payoutBatchId: z.string(),
    page: z.number().int().optional(),
    pageSize: z.number().int().optional(),
    totalRequired: z.boolean().optional(),
  }),
  execute: async ({ paypalCredentials, payoutBatchId, page, pageSize, totalRequired }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v1/payments/payouts/${encodeURIComponent(payoutBatchId)}`,
        {
          query: {
            page,
            page_size: pageSize,
            total_required: totalRequired,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to get payout batch', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error getting payout batch');
    }
  },
});

export const paypalGetPayoutItem = tool({
  description: 'Get one payout item (GET /v1/payments/payouts-item/{payoutItemId}).',
  inputSchema: z.object({
    paypalCredentials: credField,
    payoutItemId: z.string(),
  }),
  execute: async ({ paypalCredentials, payoutItemId }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v1/payments/payouts-item/${encodeURIComponent(payoutItemId)}`,
      );
      if (!result.ok) return failedResult('Failed to get payout item', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error getting payout item');
    }
  },
});
