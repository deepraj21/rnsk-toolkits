// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { stripeRequest, failedResult, toStripeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const idempotencyKey = z.string().optional();

export const stripeListSubscriptions = tool({
  description: 'List Subscriptions (GET /v1/subscriptions) with customer and status filters.',
  inputSchema: z.object({
    stripeCredentials: credField,
    customer: z.string().optional(),
    status: z
      .enum(['active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'trialing', 'all'])
      .optional(),
    limit: z.number().int().max(100).optional(),
    startingAfter: z.string().optional(),
  }),
  execute: async ({ stripeCredentials, customer, status, limit, startingAfter }) => {
    try {
      const result = await stripeRequest(stripeCredentials, '/subscriptions', {
        query: {
          customer,
          status,
          limit,
          starting_after: startingAfter,
        },
      });
      if (!result.ok) return failedResult('Failed to list subscriptions', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error listing subscriptions');
    }
  },
});

export const stripeGetSubscription = tool({
  description: 'Retrieve a Subscription (GET /v1/subscriptions/{id}).',
  inputSchema: z.object({
    stripeCredentials: credField,
    subscriptionId: z.string(),
    expand: z.array(z.string()).optional(),
  }),
  execute: async ({ stripeCredentials, subscriptionId, expand }) => {
    try {
      const result = await stripeRequest(
        stripeCredentials,
        `/subscriptions/${encodeURIComponent(subscriptionId)}`,
        { query: expand?.length ? { expand } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get subscription', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error getting subscription');
    }
  },
});

export const stripeCancelSubscription = tool({
  description: 'Cancel a Subscription (DELETE /v1/subscriptions/{id}) or at period end via params.',
  inputSchema: z.object({
    stripeCredentials: credField,
    subscriptionId: z.string(),
    atPeriodEnd: z
      .boolean()
      .optional()
      .describe('If true, cancel at period end (invoice_now false)'),
    invoiceNow: z.boolean().optional(),
    prorate: z.boolean().optional(),
    idempotencyKey,
  }),
  execute: async ({
    stripeCredentials,
    subscriptionId,
    atPeriodEnd,
    invoiceNow,
    prorate,
    idempotencyKey: idemKey,
  }) => {
    try {
      if (atPeriodEnd) {
        const result = await stripeRequest(
          stripeCredentials,
          `/subscriptions/${encodeURIComponent(subscriptionId)}`,
          {
            method: 'POST',
            body: { cancel_at_period_end: true },
            idempotencyKey: idemKey,
          },
        );
        if (!result.ok) return failedResult('Failed to schedule subscription cancel', result);
        return result.data;
      }
      const query: Record<string, unknown> = {};
      if (invoiceNow !== undefined) query.invoice_now = invoiceNow;
      if (prorate !== undefined) query.prorate = prorate;
      const result = await stripeRequest(
        stripeCredentials,
        `/subscriptions/${encodeURIComponent(subscriptionId)}`,
        {
          method: 'DELETE',
          query: Object.keys(query).length ? query : undefined,
          idempotencyKey: idemKey,
        },
      );
      if (!result.ok) return failedResult('Failed to cancel subscription', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error canceling subscription');
    }
  },
});
