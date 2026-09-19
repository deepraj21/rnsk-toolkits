// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { growwRequest, handleGrowwResult } from './utils.js';

const tokenField = z.string().optional().describe('Groww API access token (injected by system)');

export const growwGetUserMargin = tool({
  description: 'Get available user margin details (clear cash, margin used, collateral, FNO and equity breakdown). All prices in rupees.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
  }),
  execute: async ({ growwAccessToken }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/margins/detail/user');
      return handleGrowwResult(result, 'get user margin');
    } catch (error) {
      return { error: 'Error getting user margin', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

const marginOrderSchema = z.object({
  trading_symbol: z.string().describe('Trading symbol as defined by the exchange'),
  quantity: z.number().int().positive().describe('Order quantity'),
  price: z.number().optional().describe('Limit price in rupees (include for limit orders)'),
  exchange: z.string().describe('NSE or BSE'),
  segment: z.string().describe('CASH or FNO'),
  product: z.string().describe('CNC, MIS or NRML'),
  order_type: z.string().describe('MARKET, LIMIT, SL or SL_M'),
  transaction_type: z.string().describe('BUY or SELL'),
});

export const growwGetRequiredMargin = tool({
  description: 'Calculate required margin for a single order or a basket of orders (basket supported for FNO). All prices in rupees.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    segment: z.string().describe('CASH or FNO (query param; basket orders supported for FNO)'),
    orders: z.array(marginOrderSchema).min(1).describe('One or more orders to calculate margin for'),
  }),
  execute: async ({ growwAccessToken, segment, orders }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/margins/detail/orders', {
        method: 'POST',
        query: { segment },
        body: orders,
      });
      return handleGrowwResult(result, 'calculate required margin');
    } catch (error) {
      return { error: 'Error calculating margin', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
