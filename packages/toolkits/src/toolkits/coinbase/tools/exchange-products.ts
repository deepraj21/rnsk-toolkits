// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { exchangeGet, toCoinbaseError } from './client.js';

const credentialsField = {
  coinbaseCredentials: z
    .string()
    .optional()
    .describe(
      'Injected credentials JSON — only required for private endpoints (loans, wallets); ignored for public market data',
    ),
};

const productIdField = {
  productId: z.string().describe("Trading pair identifier (e.g. 'BTC-USD', 'ETH-EUR')"),
};

export const coinbaseListExchangeProducts = tool({
  description:
    'List all Coinbase Exchange trading pairs with limits, status, and configuration. Filter by spot or futures.',
  inputSchema: z.object({
    ...credentialsField,
    type: z
      .enum(['spot', 'future'])
      .optional()
      .describe('Filter products by type: spot or future'),
  }),
  execute: async ({ type }) => {
    try {
      return await exchangeGet('/products', { type });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list exchange products');
    }
  },
});

export const coinbaseGetProductDetails = tool({
  description:
    'Get configuration, limits, and trading status for one Exchange trading pair (e.g. BTC-USD).',
  inputSchema: z.object({
    ...credentialsField,
    ...productIdField,
  }),
  execute: async ({ productId }) => {
    try {
      return await exchangeGet(`/products/${encodeURIComponent(productId)}`);
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get product details');
    }
  },
});

export const coinbaseGetProductBook = tool({
  description:
    'Get the live order book (bids and asks) for an Exchange trading pair at Level 1, 2, or 3 detail.',
  inputSchema: z.object({
    ...credentialsField,
    ...productIdField,
    level: z
      .number()
      .int()
      .min(1)
      .max(3)
      .optional()
      .describe(
        'Response detail: 1 = best bid/ask only, 2 = top 50 aggregated, 3 = full book (default 1)',
      ),
  }),
  execute: async ({ productId, level }) => {
    try {
      return await exchangeGet(`/products/${encodeURIComponent(productId)}/book`, { level });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get product book');
    }
  },
});

export const coinbaseGetProductTicker = tool({
  description:
    'Get the latest trade price, best bid/ask, and 24-hour volume snapshot for an Exchange trading pair.',
  inputSchema: z.object({
    ...credentialsField,
    ...productIdField,
  }),
  execute: async ({ productId }) => {
    try {
      return await exchangeGet(`/products/${encodeURIComponent(productId)}/ticker`);
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get product ticker');
    }
  },
});

export const coinbaseListProductStats = tool({
  description:
    'Get 24-hour open/high/low/last prices and volume statistics for an Exchange trading pair.',
  inputSchema: z.object({
    ...credentialsField,
    ...productIdField,
  }),
  execute: async ({ productId }) => {
    try {
      return await exchangeGet(`/products/${encodeURIComponent(productId)}/stats`);
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get product stats');
    }
  },
});

export const coinbaseListProductTrades = tool({
  description:
    'List recent trades for an Exchange trading pair with pagination by trade ID.',
  inputSchema: z.object({
    ...credentialsField,
    ...productIdField,
    limit: z.number().int().min(1).optional().describe('Maximum number of trades to return'),
    before: z
      .number()
      .int()
      .optional()
      .describe('Paginate to trades before this trade ID (older trades)'),
    after: z
      .number()
      .int()
      .optional()
      .describe('Paginate to trades after this trade ID (newer trades)'),
  }),
  execute: async ({ productId, limit, before, after }) => {
    try {
      return await exchangeGet(`/products/${encodeURIComponent(productId)}/trades`, {
        limit,
        before,
        after,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list product trades');
    }
  },
});

export const coinbaseListProductsCandles = tool({
  description:
    'Get historical OHLCV candles for an Exchange trading pair using second-based granularity buckets (max 300 candles).',
  inputSchema: z.object({
    ...credentialsField,
    ...productIdField,
    granularity: z
      .number()
      .int()
      .optional()
      .describe(
        'Bucket size in seconds: 60, 300, 900, 3600, 21600, or 86400 (default 3600 = one hour)',
      ),
    start: z
      .string()
      .optional()
      .describe('Range start as UNIX timestamp in seconds (e.g. 1704067200)'),
    end: z
      .string()
      .optional()
      .describe('Range end as UNIX timestamp in seconds (defaults to now)'),
  }),
  execute: async ({ productId, granularity, start, end }) => {
    try {
      return await exchangeGet(`/products/${encodeURIComponent(productId)}/candles`, {
        granularity,
        start,
        end,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list product candles');
    }
  },
});

export const coinbaseGetProductsVolumeSummary = tool({
  description:
    'Get 24-hour and 30-day spot, RFQ, and conversion volumes for every Exchange product.',
  inputSchema: z.object({
    ...credentialsField,
  }),
  execute: async () => {
    try {
      return await exchangeGet('/products/volume-summary');
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get products volume summary');
    }
  },
});
