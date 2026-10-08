// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paypalRequest, failedResult, toPayPalError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const paypalCreateOrder = tool({
  description:
    'Create a Checkout order (POST /v2/checkout/orders). Set intent CAPTURE or AUTHORIZE and purchase_units with amount/currency.',
  inputSchema: z.object({
    paypalCredentials: credField,
    intent: z.enum(['CAPTURE', 'AUTHORIZE']).default('CAPTURE'),
    purchaseUnits: z
      .array(z.record(z.any()))
      .min(1)
      .describe('PayPal purchase_units array (amount, reference_id, items, etc.)'),
    payer: z.record(z.any()).optional(),
    applicationContext: z.record(z.any()).optional(),
  }),
  execute: async ({ paypalCredentials, intent, purchaseUnits, payer, applicationContext }) => {
    try {
      const body: Record<string, unknown> = { intent, purchase_units: purchaseUnits };
      if (payer) body.payer = payer;
      if (applicationContext) body.application_context = applicationContext;
      const result = await paypalRequest(paypalCredentials, '/v2/checkout/orders', {
        method: 'POST',
        body,
        preferRepresentation: true,
      });
      if (!result.ok) return failedResult('Failed to create order', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error creating order');
    }
  },
});

export const paypalGetOrder = tool({
  description: 'Get a Checkout order by ID (GET /v2/checkout/orders/{orderId}).',
  inputSchema: z.object({
    paypalCredentials: credField,
    orderId: z.string().describe('PayPal order ID'),
  }),
  execute: async ({ paypalCredentials, orderId }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v2/checkout/orders/${encodeURIComponent(orderId)}`,
      );
      if (!result.ok) return failedResult('Failed to get order', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error getting order');
    }
  },
});

export const paypalPatchOrder = tool({
  description:
    'Patch a Checkout order (PATCH /v2/checkout/orders/{orderId}) using JSON Patch operations array.',
  inputSchema: z.object({
    paypalCredentials: credField,
    orderId: z.string(),
    patchOperations: z
      .array(
        z.object({
          op: z.enum(['add', 'remove', 'replace', 'copy', 'move', 'test']),
          path: z.string(),
          value: z.any().optional(),
          from: z.string().optional(),
        }),
      )
      .min(1),
  }),
  execute: async ({ paypalCredentials, orderId, patchOperations }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v2/checkout/orders/${encodeURIComponent(orderId)}`,
        {
          method: 'PATCH',
          body: patchOperations,
        },
      );
      if (!result.ok) return failedResult('Failed to patch order', result);
      return result.data ?? { status: result.status, patched: true };
    } catch (error) {
      return toPayPalError(error, 'Error patching order');
    }
  },
});

export const paypalCaptureOrder = tool({
  description:
    'Capture payment for an approved order (POST /v2/checkout/orders/{orderId}/capture).',
  inputSchema: z.object({
    paypalCredentials: credField,
    orderId: z.string(),
    paymentSource: z.record(z.any()).optional(),
  }),
  execute: async ({ paypalCredentials, orderId, paymentSource }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
        {
          method: 'POST',
          body: paymentSource ? { payment_source: paymentSource } : undefined,
          preferRepresentation: true,
        },
      );
      if (!result.ok) return failedResult('Failed to capture order', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error capturing order');
    }
  },
});

export const paypalAuthorizeOrder = tool({
  description:
    'Authorize payment on an order for later capture (POST /v2/checkout/orders/{orderId}/authorize).',
  inputSchema: z.object({
    paypalCredentials: credField,
    orderId: z.string(),
    paymentSource: z.record(z.any()).optional(),
  }),
  execute: async ({ paypalCredentials, orderId, paymentSource }) => {
    try {
      const result = await paypalRequest(
        paypalCredentials,
        `/v2/checkout/orders/${encodeURIComponent(orderId)}/authorize`,
        {
          method: 'POST',
          body: paymentSource ? { payment_source: paymentSource } : undefined,
          preferRepresentation: true,
        },
      );
      if (!result.ok) return failedResult('Failed to authorize order', result);
      return result.data;
    } catch (error) {
      return toPayPalError(error, 'Error authorizing order');
    }
  },
});
