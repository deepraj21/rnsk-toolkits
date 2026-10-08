// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { shopifyRequest, failedResult, toShopifyError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const shopifyListOrders = tool({
  description:
    'List orders with status, financial status, fulfillment, date range, and pagination (GET /orders.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    status: z.enum(['open', 'closed', 'cancelled', 'any']).optional(),
    financialStatus: z.string().optional().describe('e.g. paid, pending, refunded, partially_paid'),
    fulfillmentStatus: z.string().optional().describe('e.g. shipped, partial, unfulfilled'),
    createdAtMin: z.string().optional().describe('ISO 8601'),
    createdAtMax: z.string().optional().describe('ISO 8601'),
    limit: z.number().int().max(250).optional(),
    sinceId: z.number().int().optional(),
    fields: z.string().optional(),
  }),
  execute: async ({
    shopifyCredentials,
    status,
    financialStatus,
    fulfillmentStatus,
    createdAtMin,
    createdAtMax,
    limit,
    sinceId,
    fields,
  }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, '/orders.json', {
        query: {
          status: status ?? 'any',
          financial_status: financialStatus,
          fulfillment_status: fulfillmentStatus,
          created_at_min: createdAtMin,
          created_at_max: createdAtMax,
          limit,
          since_id: sinceId,
          fields,
        },
      });
      if (!result.ok) return failedResult('Failed to list orders', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error listing orders');
    }
  },
});

export const shopifyGetOrder = tool({
  description: 'Get one order by ID with line items and customer (GET /orders/{id}.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    orderId: z.number().int(),
    fields: z.string().optional(),
  }),
  execute: async ({ shopifyCredentials, orderId, fields }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, `/orders/${orderId}.json`, {
        query: { fields },
      });
      if (!result.ok) return failedResult('Failed to get order', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error getting order');
    }
  },
});

export const shopifyUpdateOrder = tool({
  description:
    'Update order fields such as note, tags, email, or shipping address (PUT /orders/{id}.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    orderId: z.number().int(),
    order: z.record(z.any()).describe('Partial order resource to update'),
  }),
  execute: async ({ shopifyCredentials, orderId, order }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, `/orders/${orderId}.json`, {
        method: 'PUT',
        body: { order: { id: orderId, ...order } },
      });
      if (!result.ok) return failedResult('Failed to update order', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error updating order');
    }
  },
});

export const shopifyCancelOrder = tool({
  description:
    'Cancel an order (POST /orders/{id}/cancel.json). Optionally refund, restock, and notify customer.',
  inputSchema: z.object({
    shopifyCredentials: credField,
    orderId: z.number().int(),
    amount: z.string().optional().describe('Refund amount for partial refund'),
    currency: z.string().optional(),
    restock: z.boolean().optional(),
    reason: z
      .enum(['customer', 'fraud', 'inventory', 'declined', 'other'])
      .optional()
      .describe('Cancellation reason'),
    email: z.boolean().optional().describe('Send cancellation email to customer'),
  }),
  execute: async ({ shopifyCredentials, orderId, amount, currency, restock, reason, email }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, `/orders/${orderId}/cancel.json`, {
        method: 'POST',
        body: {
          amount,
          currency,
          restock,
          reason,
          email,
        },
      });
      if (!result.ok) return failedResult('Failed to cancel order', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error cancelling order');
    }
  },
});
