// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paypalRequest, failedResult, toPayPalError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const paypalGetCapture = tool({
  description: 'Get captured payment details (GET /v2/payments/captures/{captureId}).',
  inputSchema: z.object({
    paypalCredentials: credField,
    captureId: z.string(),
  }),
  execute: async ({ paypalCredentials, captureId }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v2/payments/captures/${encodeURIComponent(captureId)}`,
      );
      if (!result.ok) return failedResult('Failed to get capture', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error getting capture');
    }
  },
});

export const paypalRefundCapture = tool({
  description:
    'Refund a captured payment fully or partially (POST /v2/payments/captures/{captureId}/refund).',
  inputSchema: z.object({
    paypalCredentials: credField,
    captureId: z.string(),
    amount: z
      .object({
        currencyCode: z.string().describe('ISO 4217, e.g. USD'),
        value: z.string().describe('Decimal amount as string, e.g. 10.00'),
      })
      .optional()
      .describe('Omit for full refund'),
    noteToPayer: z.string().optional(),
    invoiceId: z.string().optional(),
  }),
  execute: async ({ paypalCredentials, captureId, amount, noteToPayer, invoiceId }) => {
    try {
      const body: Record<string, unknown> = {};
      if (amount) {
        body.amount = {
          currency_code: amount.currencyCode,
          value: amount.value,
        };
      }
      if (noteToPayer) body.note_to_payer = noteToPayer;
      if (invoiceId) body.invoice_id = invoiceId;

      const result = await paypalRequest(
        paypalCredentials,
        `/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
        {
          method: 'POST',
          body: Object.keys(body).length ? body : undefined,
          preferRepresentation: true,
        },
      );
      if (!result.ok) return failedResult('Failed to refund capture', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error refunding capture');
    }
  },
});

export const paypalGetRefund = tool({
  description: 'Get refund details (GET /v2/payments/refunds/{refundId}).',
  inputSchema: z.object({
    paypalCredentials: credField,
    refundId: z.string(),
  }),
  execute: async ({ paypalCredentials, refundId }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v2/payments/refunds/${encodeURIComponent(refundId)}`,
      );
      if (!result.ok) return failedResult('Failed to get refund', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error getting refund');
    }
  },
});
