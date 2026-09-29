// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { exchangeGet, exchangeSignedGet, missingCredentials, toCoinbaseError } from './client.js';

const credentialsField = {
  coinbaseCredentials: z
    .string()
    .optional()
    .describe(
      'Injected credentials JSON — only required for private endpoints (loans, wallets); ignored for public market data',
    ),
};

export const coinbaseGetExchangeCurrency = tool({
  description:
    'Get trading configuration, precision, status, and payment details for one Coinbase Exchange currency (e.g. BTC, USD, ETH).',
  inputSchema: z.object({
    ...credentialsField,
    currencyId: z
      .string()
      .describe("Currency identifier, case-sensitive (e.g. 'USD', 'BTC', 'ETH')"),
  }),
  execute: async ({ currencyId }) => {
    try {
      return await exchangeGet(`/currencies/${encodeURIComponent(currencyId)}`);
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get currency');
    }
  },
});

export const coinbaseListCurrencies = tool({
  description:
    'List every fiat and crypto currency known to Coinbase Exchange with precision, limits, and status.',
  inputSchema: z.object({
    ...credentialsField,
  }),
  execute: async () => {
    try {
      return await exchangeGet('/currencies');
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list currencies');
    }
  },
});

export const coinbaseListLoanAssets = tool({
  description:
    'List borrowable assets and accepted collateral with haircut weights for Coinbase Exchange crypto-backed loans. Requires Exchange API credentials.',
  inputSchema: z.object({
    coinbaseCredentials: z
      .string()
      .optional()
      .describe(
        'Injected credentials JSON {apiKey, apiSecret, passphrase} — required for this private endpoint',
      ),
  }),
  execute: async ({ coinbaseCredentials }) => {
    try {
      if (!coinbaseCredentials) return missingCredentials();
      return await exchangeSignedGet(coinbaseCredentials, '/loans/assets');
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list loan assets');
    }
  },
});

export const coinbaseListWrappedAssets = tool({
  description:
    'List all Coinbase wrapped assets (e.g. cbETH) with supply, conversion rate, and APY.',
  inputSchema: z.object({
    ...credentialsField,
  }),
  execute: async () => {
    try {
      return await exchangeGet('/wrapped-assets');
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list wrapped assets');
    }
  },
});

export const coinbaseGetWrappedAssetConversionRate = tool({
  description:
    'Get the current exchange ratio between a wrapped asset and its underlying asset (e.g. cbETH to ETH).',
  inputSchema: z.object({
    ...credentialsField,
    wrappedAssetId: z
      .string()
      .describe("Wrapped asset symbol as shown on Coinbase Exchange (e.g. 'CBETH')"),
  }),
  execute: async ({ wrappedAssetId }) => {
    try {
      return await exchangeGet(
        `/wrapped-assets/${encodeURIComponent(wrappedAssetId)}/conversion-rate`,
      );
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get wrapped asset conversion rate');
    }
  },
});
