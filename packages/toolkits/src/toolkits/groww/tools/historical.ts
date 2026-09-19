// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { growwRequest, handleGrowwResult } from './utils.js';

const tokenField = z.string().optional().describe('Groww API access token (injected by system)');

export const growwGetHistoricalCandles = tool({
  description: 'Get historical OHLCV candles (+OI for FNO) for backtesting using a Groww symbol like NSE-WIPRO or NSE-NIFTY-30Sep25-24650-CE. Data available from 2020. Limits: <=5min intervals 30 days/req, 10-30min 90 days, >=1h 180 days.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    exchange: z.string().describe('NSE or BSE'),
    segment: z.string().describe('CASH or FNO'),
    groww_symbol: z.string().describe('Groww symbol, e.g. NSE-WIPRO, NSE-NIFTY-30Sep25-24650-CE'),
    start_time: z.string().describe('Start time yyyy-MM-dd HH:mm:ss or epoch seconds'),
    end_time: z.string().describe('End time yyyy-MM-dd HH:mm:ss or epoch seconds'),
    candle_interval: z.string().describe('1minute, 2minute, 3minute, 5minute, 10minute, 15minute, 30minute, hour, 4hour, day, week or month'),
  }),
  execute: async ({ growwAccessToken, ...query }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/historical/candles', { query });
      return handleGrowwResult(result, 'get historical candles');
    } catch (error) {
      return { error: 'Error getting historical candles', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetHistoricalCandleRange = tool({
  description: 'DEPRECATED by Groww (use growwGetHistoricalCandles instead). Get historical candles by trading symbol for a time range.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    exchange: z.string().describe('NSE or BSE'),
    segment: z.string().describe('CASH or FNO'),
    trading_symbol: z.string().describe('Trading symbol, e.g. WIPRO'),
    start_time: z.string().describe('Start time yyyy-MM-dd HH:mm:ss or epoch seconds'),
    end_time: z.string().describe('End time yyyy-MM-dd HH:mm:ss or epoch seconds'),
    interval_in_minutes: z.string().optional().describe('Candle interval in minutes, e.g. 1, 5, 60, 1440'),
  }),
  execute: async ({ growwAccessToken, ...query }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/historical/candle/range', { query });
      return handleGrowwResult(result, 'get historical candle range');
    } catch (error) {
      return { error: 'Error getting historical data', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetExpiries = tool({
  description: 'List available FNO expiry dates for an underlying. Combine with contracts + historical candles for backtesting. Data from 2020.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    exchange: z.string().describe('NSE or BSE'),
    underlying_symbol: z.string().describe('Underlying symbol, e.g. NIFTY, BANKNIFTY'),
    year: z.number().int().min(2020).optional().describe('Year 2020-current, defaults to current year'),
    month: z.number().int().min(1).max(12).optional().describe('Month 1-12, omit for whole year'),
  }),
  execute: async ({ growwAccessToken, ...query }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/historical/expiries', { query });
      return handleGrowwResult(result, 'get expiries');
    } catch (error) {
      return { error: 'Error getting expiries', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetContracts = tool({
  description: 'List Groww symbols of FNO contracts for an underlying and expiry date.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    exchange: z.string().describe('NSE or BSE'),
    underlying_symbol: z.string().describe('Underlying symbol 1-20 chars, e.g. NIFTY'),
    expiry_date: z.string().describe('Expiry date YYYY-MM-DD'),
  }),
  execute: async ({ growwAccessToken, ...query }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/historical/contracts', { query });
      return handleGrowwResult(result, 'get contracts');
    } catch (error) {
      return { error: 'Error getting contracts', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
