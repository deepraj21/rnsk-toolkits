// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { growwRequest, handleGrowwResult } from './utils.js';

const tokenField = z.string().optional().describe('Groww API access token (injected by system)');

export const growwGetQuote = tool({
  description: 'Get full live snapshot for an instrument: last price, market depth, OHLC, volumes, OI, circuits, 52-week high/low.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    exchange: z.string().describe('NSE or BSE'),
    segment: z.string().describe('CASH for stocks/indices, FNO for derivatives'),
    trading_symbol: z.string().describe('Trading symbol, e.g. NIFTY, RELIANCE'),
  }),
  execute: async ({ growwAccessToken, exchange, segment, trading_symbol }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/live-data/quote', {
        query: { exchange, segment, trading_symbol },
      });
      return handleGrowwResult(result, 'get quote');
    } catch (error) {
      return { error: 'Error getting quote', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetLtp = tool({
  description: 'Get last traded price for up to 50 instruments. exchange_symbols is a comma-separated list like NSE_RELIANCE,BSE_SENSEX.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    segment: z.string().describe('CASH or FNO'),
    exchange_symbols: z.string().describe('Comma-separated EXCHANGE_SYMBOL list, e.g. NSE_RELIANCE,BSE_SENSEX (max 50)'),
  }),
  execute: async ({ growwAccessToken, segment, exchange_symbols }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/live-data/ltp', {
        query: { segment, exchange_symbols },
      });
      return handleGrowwResult(result, 'get LTP');
    } catch (error) {
      return { error: 'Error getting LTP', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetOhlc = tool({
  description: 'Get real-time OHLC snapshot (not interval candles) for up to 50 instruments.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    segment: z.string().describe('CASH or FNO'),
    exchange_symbols: z.string().describe('Comma-separated EXCHANGE_SYMBOL list, e.g. NSE_RELIANCE,BSE_SENSEX (max 50)'),
  }),
  execute: async ({ growwAccessToken, segment, exchange_symbols }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/live-data/ohlc', {
        query: { segment, exchange_symbols },
      });
      return handleGrowwResult(result, 'get OHLC');
    } catch (error) {
      return { error: 'Error getting OHLC', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetOptionChain = tool({
  description: 'Get full FNO option chain with Greeks, LTP, OI and volume for an underlying and expiry.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    exchange: z.string().describe('NSE or BSE'),
    underlying: z.string().describe('Underlying symbol, e.g. NIFTY, BANKNIFTY'),
    expiry_date: z.string().describe('Expiry date in YYYY-MM-DD format'),
  }),
  execute: async ({ growwAccessToken, exchange, underlying, expiry_date }) => {
    try {
      const result = await growwRequest(
        growwAccessToken,
        `/v1/option-chain/exchange/${encodeURIComponent(exchange)}/underlying/${encodeURIComponent(underlying)}`,
        { query: { expiry_date } },
      );
      return handleGrowwResult(result, 'get option chain');
    } catch (error) {
      return { error: 'Error getting option chain', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetGreeks = tool({
  description: 'Get Greeks (delta, gamma, theta, vega, rho, IV) for a single FNO contract.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    exchange: z.string().describe('NSE or BSE'),
    underlying: z.string().describe('Underlying symbol, e.g. NIFTY'),
    trading_symbol: z.string().describe('FNO trading symbol, e.g. NIFTY25O1425100CE'),
    expiry: z.string().describe('Expiry date in YYYY-MM-DD format'),
  }),
  execute: async ({ growwAccessToken, exchange, underlying, trading_symbol, expiry }) => {
    try {
      const result = await growwRequest(
        growwAccessToken,
        `/v1/live-data/greeks/exchange/${encodeURIComponent(exchange)}/underlying/${encodeURIComponent(underlying)}/trading_symbol/${encodeURIComponent(trading_symbol)}/expiry/${encodeURIComponent(expiry)}`,
      );
      return handleGrowwResult(result, 'get greeks');
    } catch (error) {
      return { error: 'Error getting greeks', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
