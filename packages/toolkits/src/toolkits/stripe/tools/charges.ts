// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { stripeRequest, failedResult, toStripeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const stripeGetCharge = tool({
  description: 'Retrieve a Charge (GET /v1/charges/{id}).',
  inputSchema: z.object({
    stripeCredentials: credField,
    chargeId: z.string().describe('Charge ID (ch_...)'),
    expand: z.array(z.string()).optional(),
  }),
  execute: async ({ stripeCredentials, chargeId, expand }) => {
    try {
      const result = await stripeRequest(
        stripeCredentials,
        `/charges/${encodeURIComponent(chargeId)}`,
        { query: expand?.length ? { expand } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get charge', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error getting charge');
    }
  },
});

export const stripeListCharges = tool({
  description: 'List Charges with filters and pagination (GET /v1/charges).',
  inputSchema: z.object({
    stripeCredentials: credField,
    customer: z.string().optional(),
    paymentIntent: z.string().optional(),
    limit: z.number().int().max(100).optional(),
    startingAfter: z.string().optional(),
    endingBefore: z.string().optional(),
    createdGte: z.number().int().optional().describe('Unix timestamp, created[gte]'),
    createdLte: z.number().int().optional(),
  }),
  execute: async ({
    stripeCredentials,
    customer,
    paymentIntent,
    limit,
    startingAfter,
    endingBefore,
    createdGte,
    createdLte,
  }) => {
    try {
      const query: Record<string, unknown> = {
        customer,
        payment_intent: paymentIntent,
        limit,
        starting_after: startingAfter,
        ending_before: endingBefore,
      };
      if (createdGte !== undefined) query['created[gte]'] = createdGte;
      if (createdLte !== undefined) query['created[lte]'] = createdLte;
      const result = await stripeRequest(stripeCredentials, '/charges', { query });
      if (!result.ok) return failedResult('Failed to list charges', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error listing charges');
    }
  },
});
