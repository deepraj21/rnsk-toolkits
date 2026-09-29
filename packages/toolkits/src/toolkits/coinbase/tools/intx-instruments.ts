// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { intxGet, toCoinbaseError } from './client.js';

const credentialsField = {
  coinbaseCredentials: z
    .string()
    .optional()
    .describe(
      'Injected credentials JSON — only required for private endpoints (loans, wallets); ignored for public market data',
    ),
};

const instrumentField = {
  instrument: z
    .string()
    .describe('Instrument identifier: name (e.g. BTC-PERP, BTC-USDC), UUID, or instrument ID'),
};

export const coinbaseListInstruments = tool({
  description:
    'List all spot and perpetual-futures instruments on International Exchange with trading parameters and 24-hour statistics.',
  inputSchema: z.object({
    ...credentialsField,
  }),
  execute: async () => {
    try {
      return await intxGet('/api/v1/instruments');
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list instruments');
    }
  },
});

export const coinbaseGetInstrumentDetails = tool({
  description:
    'Get full configuration, margin factors, and 24-hour statistics for one International Exchange instrument (e.g. BTC-PERP).',
  inputSchema: z.object({
    ...credentialsField,
    ...instrumentField,
  }),
  execute: async ({ instrument }) => {
    try {
      return await intxGet(`/api/v1/instruments/${encodeURIComponent(instrument)}`);
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get instrument details');
    }
  },
});

export const coinbaseGetInstrumentQuote = tool({
  description:
    'Get the live bid/ask quote, mark price, and last trade for one International Exchange instrument.',
  inputSchema: z.object({
    ...credentialsField,
    ...instrumentField,
  }),
  execute: async ({ instrument }) => {
    try {
      return await intxGet(`/api/v1/instruments/${encodeURIComponent(instrument)}/quote`);
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get instrument quote');
    }
  },
});

export const coinbaseGetInstrumentFunding = tool({
  description:
    'Get historical perpetual-futures funding rates with mark prices and event times for one International Exchange instrument.',
  inputSchema: z.object({
    ...credentialsField,
    ...instrumentField,
    resultLimit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Number of funding records to return (default 25, max 100)'),
    resultOffset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Number of records to skip for pagination'),
  }),
  execute: async ({ instrument, resultLimit, resultOffset }) => {
    try {
      return await intxGet(`/api/v1/instruments/${encodeURIComponent(instrument)}/funding`, {
        result_limit: resultLimit,
        result_offset: resultOffset,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get funding rates');
    }
  },
});

export const coinbaseListInstrumentCandles = tool({
  description:
    'Get OHLCV candle history for an International Exchange instrument over a custom time range and granularity.',
  inputSchema: z.object({
    ...credentialsField,
    ...instrumentField,
    granularity: z
      .enum([
        'ONE_MINUTE',
        'FIVE_MINUTE',
        'FIFTEEN_MINUTE',
        'THIRTY_MINUTE',
        'ONE_HOUR',
        'TWO_HOUR',
        'SIX_HOUR',
        'ONE_DAY',
      ])
      .describe('Candle aggregation period'),
    start: z.string().describe('Range start in ISO 8601 format (e.g. 2024-03-01T00:00:00Z)'),
    end: z.string().optional().describe('Range end in ISO 8601 format (defaults to now)'),
  }),
  execute: async ({ instrument, granularity, start, end }) => {
    try {
      return await intxGet(`/api/v1/instruments/${encodeURIComponent(instrument)}/candles`, {
        granularity,
        start,
        end,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list instrument candles');
    }
  },
});

export const coinbaseGetDailyTradingVolume = tool({
  description:
    'Get per-day trading volumes for International Exchange instruments, with per-instrument breakdowns and exchange-wide totals.',
  inputSchema: z.object({
    ...credentialsField,
    instruments: z.string().describe('Comma-separated instrument names (e.g. BTC-PERP,ETH-PERP)'),
    timeFrom: z
      .string()
      .optional()
      .describe('First date to include, ISO 8601 format (e.g. 2024-03-01T00:00:00Z)'),
    showOther: z
      .boolean()
      .optional()
      .describe('Include an OTHER bucket with volumes of filtered-out instruments'),
    resultLimit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Number of daily results to return (default 60, max 100)'),
    resultOffset: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Number of results to skip for pagination'),
  }),
  execute: async ({ instruments, timeFrom, showOther, resultLimit, resultOffset }) => {
    try {
      return await intxGet('/api/v1/instruments/volumes/daily', {
        instruments,
        time_from: timeFrom,
        show_other: showOther,
        result_limit: resultLimit,
        result_offset: resultOffset,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get daily trading volume');
    }
  },
});
