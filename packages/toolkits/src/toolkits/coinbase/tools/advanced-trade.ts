// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { advGet, toCoinbaseError } from './client.js';

const credentialsField = {
  coinbaseCredentials: z
    .string()
    .optional()
    .describe(
      'Injected credentials JSON — only required for private endpoints (loans, wallets); ignored for public market data',
    ),
};

export const coinbaseGetServerTime = tool({
  description:
    'Get current Coinbase server time in ISO, epoch seconds, and epoch millis for signing time-sensitive requests.',
  inputSchema: z.object({
    ...credentialsField,
  }),
  execute: async () => {
    try {
      return await advGet('/time');
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get server time');
    }
  },
});

export const coinbaseListMarketProducts = tool({
  description:
    'List Advanced Trade trading products with prices, volumes, and limits. Filter by IDs, spot/futures type, and sort order.',
  inputSchema: z.object({
    ...credentialsField,
    limit: z.number().int().min(1).optional().describe('Number of products to return'),
    offset: z.number().int().min(0).optional().describe('Number of products to skip'),
    cursor: z
      .string()
      .optional()
      .describe('Base64 pagination cursor from a previous response for the next page'),
    productIds: z
      .array(z.string())
      .optional()
      .describe("Filter to specific trading pairs (e.g. ['BTC-USD', 'ETH-USD'])"),
    productType: z
      .enum(['SPOT', 'FUTURE', 'UNKNOWN_PRODUCT_TYPE'])
      .optional()
      .describe('Filter by product type (default returns SPOT only)'),
    getAllProducts: z
      .boolean()
      .optional()
      .describe('Return all products including expired futures contracts'),
    productsSortOrder: z
      .enum(['PRODUCTS_SORT_ORDER_VOLUME_24H_DESCENDING', 'PRODUCTS_SORT_ORDER_LIST_TIME_DESCENDING'])
      .optional()
      .describe('Sort order for the product list'),
    contractExpiryType: z
      .enum(['EXPIRING', 'PERPETUAL', 'UNKNOWN_CONTRACT_EXPIRY_TYPE'])
      .optional()
      .describe('Filter futures by contract expiry type'),
    expiringContractStatus: z
      .enum(['STATUS_UNEXPIRED', 'STATUS_EXPIRED', 'STATUS_ALL', 'UNKNOWN_EXPIRING_CONTRACT_STATUS'])
      .optional()
      .describe('Filter expiring futures contracts by status'),
  }),
  execute: async ({
    limit,
    offset,
    cursor,
    productIds,
    productType,
    getAllProducts,
    productsSortOrder,
    contractExpiryType,
    expiringContractStatus,
  }) => {
    try {
      return await advGet('/market/products', {
        limit,
        offset,
        cursor,
        product_ids: productIds,
        product_type: productType,
        get_all_products: getAllProducts,
        products_sort_order: productsSortOrder,
        contract_expiry_type: contractExpiryType,
        expiring_contract_status: expiringContractStatus,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list market products');
    }
  },
});

export const coinbaseGetMarketProductBook = tool({
  description:
    'Get the Advanced Trade order book with bids, asks, last price, mid-market price, and spread for a product.',
  inputSchema: z.object({
    ...credentialsField,
    productId: z.string().describe("Trading pair (e.g. 'BTC-USD')"),
    limit: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe('Number of bid/ask levels to return (default set by the API)'),
    aggregationPriceIncrement: z
      .string()
      .optional()
      .describe("Minimum price interval for grouping orders in the book (e.g. '0.01')"),
  }),
  execute: async ({ productId, limit, aggregationPriceIncrement }) => {
    try {
      return await advGet('/market/product_book', {
        product_id: productId,
        limit,
        aggregation_price_increment: aggregationPriceIncrement,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get market product book');
    }
  },
});

export const coinbaseGetPublicMarketTrades = tool({
  description:
    'Get recent Advanced Trade market trades plus current best bid and ask for a product.',
  inputSchema: z.object({
    ...credentialsField,
    productId: z.string().describe("Trading pair (e.g. 'BTC-USD')"),
    limit: z.number().int().min(1).max(1000).describe('Number of trades to return (1-1000)'),
    start: z
      .string()
      .optional()
      .describe('UNIX timestamp: only trades at or after this time'),
    end: z
      .string()
      .optional()
      .describe('UNIX timestamp: only trades before this time'),
  }),
  execute: async ({ productId, limit, start, end }) => {
    try {
      return await advGet(`/market/products/${encodeURIComponent(productId)}/ticker`, {
        limit,
        start,
        end,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get public market trades');
    }
  },
});

export const coinbaseListProductCandles = tool({
  description:
    'Get Advanced Trade OHLCV candles for a product using named granularities like ONE_HOUR (max 300 candles).',
  inputSchema: z.object({
    ...credentialsField,
    productId: z.string().describe("Trading pair (e.g. 'BTC-USD')"),
    granularity: z
      .enum([
        'ONE_MINUTE',
        'FIVE_MINUTE',
        'FIFTEEN_MINUTE',
        'THIRTY_MINUTE',
        'ONE_HOUR',
        'TWO_HOUR',
        'FOUR_HOUR',
        'SIX_HOUR',
        'ONE_DAY',
        'UNKNOWN_GRANULARITY',
      ])
      .describe('Candle interval (e.g. ONE_HOUR)'),
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
      return await advGet(`/market/products/${encodeURIComponent(productId)}/candles`, {
        granularity,
        start,
        end,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list product candles');
    }
  },
});
