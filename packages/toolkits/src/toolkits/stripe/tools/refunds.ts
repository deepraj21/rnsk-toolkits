// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { stripeRequest, failedResult, toStripeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const idempotencyKey = z.string().optional();

export const stripeCreateRefund = tool({
  description:
    'Create a Refund (POST /v1/refunds) for a charge or payment intent. Omit amount for full refund.',
  inputSchema: z.object({
    stripeCredentials: credField,
    charge: z.string().optional().describe('Charge ID (ch_...)'),
    paymentIntent: z.string().optional().describe('PaymentIntent ID (pi_...)'),
    amount: z.number().int().optional().describe('Partial refund amount in smallest currency unit'),
    reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
    metadata: z.record(z.string()).optional(),
    idempotencyKey,
  }),
  execute: async ({
    stripeCredentials,
    charge,
    paymentIntent,
    amount,
    reason,
    metadata,
    idempotencyKey: idemKey,
  }) => {
    try {
      const body: Record<string, unknown> = {};
      if (charge) body.charge = charge;
      if (paymentIntent) body.payment_intent = paymentIntent;
      if (amount !== undefined) body.amount = amount;
      if (reason) body.reason = reason;
      if (metadata) body.metadata = metadata;
      const result = await stripeRequest(stripeCredentials, '/refunds', {
        method: 'POST',
        body,
        idempotencyKey: idemKey,
      });
      if (!result.ok) return failedResult('Failed to create refund', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error creating refund');
    }
  },
});
