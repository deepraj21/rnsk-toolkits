// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { growwRequest, handleGrowwResult } from './utils.js';

const tokenField = z.string().optional().describe('Groww API access token (injected by system)');

export const growwGetHoldings = tool({
  description: 'Get current DEMAT stock holdings (ISIN, trading symbol, quantity, average price, pledge/locked quantities).',
  inputSchema: z.object({
    growwAccessToken: tokenField,
  }),
  execute: async ({ growwAccessToken }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/holdings/user');
      return handleGrowwResult(result, 'get holdings');
    } catch (error) {
      return { error: 'Error getting holdings', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetPositions = tool({
  description: 'Get all user positions (credit/debit quantities and prices, carry-forward, net quantity, realised P&L).',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    segment: z.string().optional().describe('Filter by segment: CASH or FNO'),
  }),
  execute: async ({ growwAccessToken, segment }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/positions/user', {
        query: { segment },
      });
      return handleGrowwResult(result, 'get positions');
    } catch (error) {
      return { error: 'Error getting positions', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetPositionForSymbol = tool({
  description: 'Get user position for a particular trading symbol.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    trading_symbol: z.string().describe('Trading symbol, e.g. RELIANCE'),
    segment: z.string().optional().describe('CASH or FNO'),
  }),
  execute: async ({ growwAccessToken, trading_symbol, segment }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/positions/trading-symbol', {
        query: { trading_symbol, segment },
      });
      return handleGrowwResult(result, 'get position for symbol');
    } catch (error) {
      return { error: 'Error getting position', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
