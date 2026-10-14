// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { stripeRequest, failedResult, toStripeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const idempotencyKey = z.string().optional();

export const stripeCreatePaymentIntent = tool({
  description:
    'Create a PaymentIntent (POST /v1/payment_intents). amount is in smallest currency unit (e.g. cents).',
  inputSchema: z.object({
    stripeCredentials: credField,
    amount: z.number().int().describe('Amount in smallest currency unit'),
    currency: z.string().describe('ISO currency code, e.g. usd'),
    customer: z.string().optional().describe('Customer ID'),
    paymentMethod: z.string().optional(),
    confirm: z.boolean().optional(),
    captureMethod: z.enum(['automatic', 'automatic_async', 'manual']).optional(),
    description: z.string().optional(),
    metadata: z.record(z.string()).optional(),
    params: z.record(z.any()).optional(),
    idempotencyKey,
  }),
  execute: async ({
    stripeCredentials,
    amount,
    currency,
    customer,
    paymentMethod,
    confirm,
    captureMethod,
    description,
    metadata,
    params,
    idempotencyKey: idemKey,
  }) => {
    try {
      const body: Record<string, unknown> = { amount, currency, ...params };
      if (customer) body.customer = customer;
      if (paymentMethod) body.payment_method = paymentMethod;
      if (confirm !== undefined) body.confirm = confirm;
      if (captureMethod) body.capture_method = captureMethod;
      if (description) body.description = description;
      if (metadata) body.metadata = metadata;
      const result = await stripeRequest(stripeCredentials, '/payment_intents', {
        method: 'POST',
        body,
        idempotencyKey: idemKey,
      });
      if (!result.ok) return failedResult('Failed to create payment intent', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error creating payment intent');
    }
  },
});

export const stripeGetPaymentIntent = tool({
  description: 'Retrieve a PaymentIntent (GET /v1/payment_intents/{id}).',
  inputSchema: z.object({
    stripeCredentials: credField,
    paymentIntentId: z.string(),
    expand: z.array(z.string()).optional(),
  }),
  execute: async ({ stripeCredentials, paymentIntentId, expand }) => {
    try {
      const result = await stripeRequest(
        stripeCredentials,
        `/payment_intents/${encodeURIComponent(paymentIntentId)}`,
        { query: expand?.length ? { expand } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get payment intent', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error getting payment intent');
    }
  },
});

export const stripeCancelPaymentIntent = tool({
  description: 'Cancel a PaymentIntent (POST /v1/payment_intents/{id}/cancel).',
  inputSchema: z.object({
    stripeCredentials: credField,
    paymentIntentId: z.string(),
    cancellationReason: z
      .enum(['duplicate', 'fraudulent', 'requested_by_customer', 'abandoned'])
      .optional(),
    idempotencyKey,
  }),
  execute: async ({
    stripeCredentials,
    paymentIntentId,
    cancellationReason,
    idempotencyKey: idemKey,
  }) => {
    try {
      const body: Record<string, unknown> = {};
      if (cancellationReason) body.cancellation_reason = cancellationReason;
      const result = await stripeRequest(
        stripeCredentials,
        `/payment_intents/${encodeURIComponent(paymentIntentId)}/cancel`,
        {
          method: 'POST',
          body: Object.keys(body).length ? body : {},
          idempotencyKey: idemKey,
        },
      );
      if (!result.ok) return failedResult('Failed to cancel payment intent', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error canceling payment intent');
    }
  },
});
