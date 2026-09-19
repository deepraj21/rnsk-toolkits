// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { growwRequest, handleGrowwResult } from './utils.js';

const tokenField = z.string().optional().describe('Groww API access token (injected by system)');
const segmentField = z.string().describe('Segment of the instrument: CASH or FNO');

export const growwPlaceOrder = tool({
  description: 'Place a new equity or F&O order on Groww. Requires trading_symbol, quantity, validity, exchange, segment, product, order_type, transaction_type and a unique order_reference_id (8-20 alphanumerics, max 2 hyphens).',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    trading_symbol: z.string().describe('Trading symbol as defined by the exchange, e.g. WIPRO, RELIANCE'),
    quantity: z.number().int().positive().describe('Order quantity'),
    price: z.number().optional().describe('Limit price in rupees (required for LIMIT/SL orders)'),
    trigger_price: z.number().optional().describe('Trigger price in rupees (required for SL/SL_M orders)'),
    validity: z.string().describe('Order validity, e.g. DAY, IOC'),
    exchange: z.string().describe('Stock exchange: NSE or BSE'),
    segment: segmentField,
    product: z.string().describe('Product type: CNC, MIS or NRML'),
    order_type: z.string().describe('Order type: MARKET, LIMIT, SL or SL_M'),
    transaction_type: z.string().describe('BUY or SELL'),
    order_reference_id: z.string().describe('User-provided 8-20 char alphanumeric idempotency key with at most two hyphens'),
  }),
  execute: async ({ growwAccessToken, ...body }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/order/create', { method: 'POST', body });
      return handleGrowwResult(result, 'place order');
    } catch (error) {
      return { error: 'Error placing order', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwModifyOrder = tool({
  description: 'Modify a pending/open Groww order (quantity, price, trigger_price, order_type).',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    groww_order_id: z.string().describe('Groww order ID to modify'),
    segment: segmentField,
    order_type: z.string().describe('Order type: MARKET, LIMIT, SL or SL_M'),
    quantity: z.number().int().positive().optional().describe('Updated quantity'),
    price: z.number().optional().describe('Updated limit price in rupees'),
    trigger_price: z.number().optional().describe('Updated trigger price in rupees'),
  }),
  execute: async ({ growwAccessToken, ...body }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/order/modify', { method: 'POST', body });
      return handleGrowwResult(result, 'modify order');
    } catch (error) {
      return { error: 'Error modifying order', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwCancelOrder = tool({
  description: 'Cancel a pending/open Groww order.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    groww_order_id: z.string().describe('Groww order ID to cancel'),
    segment: segmentField,
  }),
  execute: async ({ growwAccessToken, groww_order_id, segment }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/order/cancel', {
        method: 'POST',
        body: { groww_order_id, segment },
      });
      return handleGrowwResult(result, 'cancel order');
    } catch (error) {
      return { error: 'Error cancelling order', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetTradesForOrder = tool({
  description: 'Get all trades (fills) assigned to a Groww order ID. One order may have multiple fills.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    groww_order_id: z.string().describe('Groww order ID'),
    segment: segmentField,
    page: z.number().int().min(0).optional().describe('Page number, default 0'),
    page_size: z.number().int().min(1).max(50).optional().describe('Page size, max 50'),
  }),
  execute: async ({ growwAccessToken, groww_order_id, segment, page, page_size }) => {
    try {
      const result = await growwRequest(growwAccessToken, `/v1/order/trades/${encodeURIComponent(groww_order_id)}`, {
        query: { segment, page, page_size },
      });
      return handleGrowwResult(result, 'get trades for order');
    } catch (error) {
      return { error: 'Error getting trades', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetOrderStatus = tool({
  description: 'Check status of a Groww order using its groww_order_id.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    groww_order_id: z.string().describe('Groww order ID'),
    segment: segmentField,
  }),
  execute: async ({ growwAccessToken, groww_order_id, segment }) => {
    try {
      const result = await growwRequest(growwAccessToken, `/v1/order/status/${encodeURIComponent(groww_order_id)}`, {
        query: { segment },
      });
      return handleGrowwResult(result, 'get order status');
    } catch (error) {
      return { error: 'Error getting order status', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetOrderStatusByReferenceId = tool({
  description: 'Check status of a Groww order using your own order_reference_id.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    order_reference_id: z.string().describe('User-provided order reference ID'),
    segment: segmentField,
  }),
  execute: async ({ growwAccessToken, order_reference_id, segment }) => {
    try {
      const result = await growwRequest(
        growwAccessToken,
        `/v1/order/status/reference/${encodeURIComponent(order_reference_id)}`,
        { query: { segment } },
      );
      return handleGrowwResult(result, 'get order status by reference ID');
    } catch (error) {
      return { error: 'Error getting order status', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwListOrders = tool({
  description: 'List today\u2019s Groww orders (open, pending and executed) with pagination.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    segment: z.string().optional().describe('Filter by segment: CASH or FNO'),
    page: z.number().int().min(0).optional().describe('Page number, default 0'),
    page_size: z.number().int().min(1).max(100).optional().describe('Page size, max 100'),
  }),
  execute: async ({ growwAccessToken, segment, page, page_size }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/order/list', {
        query: { segment, page, page_size },
      });
      return handleGrowwResult(result, 'list orders');
    } catch (error) {
      return { error: 'Error listing orders', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetOrderDetail = tool({
  description: 'Get full details of a Groww order using its groww_order_id.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    groww_order_id: z.string().describe('Groww order ID'),
    segment: segmentField,
  }),
  execute: async ({ growwAccessToken, groww_order_id, segment }) => {
    try {
      const result = await growwRequest(growwAccessToken, `/v1/order/detail/${encodeURIComponent(groww_order_id)}`, {
        query: { segment },
      });
      return handleGrowwResult(result, 'get order detail');
    } catch (error) {
      return { error: 'Error getting order detail', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
