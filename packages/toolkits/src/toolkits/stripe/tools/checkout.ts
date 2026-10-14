// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { stripeRequest, failedResult, toStripeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const idempotencyKey = z.string().optional();

export const stripeCreateCheckoutSession = tool({
  description:
    'Create a Checkout Session (POST /v1/checkout/sessions). Typical mode payment or subscription with line_items or price IDs.',
  inputSchema: z.object({
    stripeCredentials: credField,
    mode: z.enum(['payment', 'setup', 'subscription']),
    successUrl: z.string().url(),
    cancelUrl: z.string().url().optional(),
    customer: z.string().optional(),
    customerEmail: z.string().email().optional(),
    lineItems: z.array(z.record(z.any())).optional(),
    metadata: z.record(z.string()).optional(),
    params: z.record(z.any()).optional().describe('Full session params (line_items, etc.)'),
    idempotencyKey,
  }),
  execute: async ({
    stripeCredentials,
    mode,
    successUrl,
    cancelUrl,
    customer,
    customerEmail,
    lineItems,
    metadata,
    params,
    idempotencyKey: idemKey,
  }) => {
    try {
      const body: Record<string, unknown> = {
        mode,
        success_url: successUrl,
        ...params,
      };
      if (cancelUrl) body.cancel_url = cancelUrl;
      if (customer) body.customer = customer;
      if (customerEmail) body.customer_email = customerEmail;
      if (lineItems) body.line_items = lineItems;
      if (metadata) body.metadata = metadata;
      const result = await stripeRequest(stripeCredentials, '/checkout/sessions', {
        method: 'POST',
        body,
        idempotencyKey: idemKey,
      });
      if (!result.ok) return failedResult('Failed to create checkout session', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error creating checkout session');
    }
  },
});

export const stripeGetCheckoutSession = tool({
  description: 'Retrieve a Checkout Session (GET /v1/checkout/sessions/{id}).',
  inputSchema: z.object({
    stripeCredentials: credField,
    sessionId: z.string().describe('Checkout Session ID (cs_...)'),
    expand: z.array(z.string()).optional(),
  }),
  execute: async ({ stripeCredentials, sessionId, expand }) => {
    try {
      const result = await stripeRequest(
        stripeCredentials,
        `/checkout/sessions/${encodeURIComponent(sessionId)}`,
        { query: expand?.length ? { expand } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get checkout session', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error getting checkout session');
    }
  },
});
