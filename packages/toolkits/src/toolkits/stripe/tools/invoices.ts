// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { stripeRequest, failedResult, toStripeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const idempotencyKey = z.string().optional();

export const stripeCreateInvoice = tool({
  description: 'Create a draft Invoice (POST /v1/invoices) for a customer.',
  inputSchema: z.object({
    stripeCredentials: credField,
    customer: z.string().describe('Customer ID'),
    collectionMethod: z.enum(['charge_automatically', 'send_invoice']).optional(),
    daysUntilDue: z.number().int().optional(),
    metadata: z.record(z.string()).optional(),
    params: z.record(z.any()).optional(),
    idempotencyKey,
  }),
  execute: async ({
    stripeCredentials,
    customer,
    collectionMethod,
    daysUntilDue,
    metadata,
    params,
    idempotencyKey: idemKey,
  }) => {
    try {
      const body: Record<string, unknown> = { customer, ...params };
      if (collectionMethod) body.collection_method = collectionMethod;
      if (daysUntilDue !== undefined) body.days_until_due = daysUntilDue;
      if (metadata) body.metadata = metadata;
      const result = await stripeRequest(stripeCredentials, '/invoices', {
        method: 'POST',
        body,
        idempotencyKey: idemKey,
      });
      if (!result.ok) return failedResult('Failed to create invoice', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error creating invoice');
    }
  },
});

export const stripeGetInvoice = tool({
  description: 'Retrieve an Invoice (GET /v1/invoices/{id}).',
  inputSchema: z.object({
    stripeCredentials: credField,
    invoiceId: z.string(),
    expand: z.array(z.string()).optional(),
  }),
  execute: async ({ stripeCredentials, invoiceId, expand }) => {
    try {
      const result = await stripeRequest(
        stripeCredentials,
        `/invoices/${encodeURIComponent(invoiceId)}`,
        { query: expand?.length ? { expand } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get invoice', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error getting invoice');
    }
  },
});

export const stripeFinalizeInvoice = tool({
  description: 'Finalize a draft Invoice (POST /v1/invoices/{id}/finalize).',
  inputSchema: z.object({
    stripeCredentials: credField,
    invoiceId: z.string(),
    autoAdvance: z.boolean().optional(),
    idempotencyKey,
  }),
  execute: async ({ stripeCredentials, invoiceId, autoAdvance, idempotencyKey: idemKey }) => {
    try {
      const body: Record<string, unknown> = {};
      if (autoAdvance !== undefined) body.auto_advance = autoAdvance;
      const result = await stripeRequest(
        stripeCredentials,
        `/invoices/${encodeURIComponent(invoiceId)}/finalize`,
        {
          method: 'POST',
          body: Object.keys(body).length ? body : {},
          idempotencyKey: idemKey,
        },
      );
      if (!result.ok) return failedResult('Failed to finalize invoice', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error finalizing invoice');
    }
  },
});
