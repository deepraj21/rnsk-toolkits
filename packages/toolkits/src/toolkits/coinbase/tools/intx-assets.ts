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

export const coinbaseListAssets = tool({
  description:
    'List all tradable assets on Coinbase International Exchange with status, collateral weights, and borrow limits. Start here to discover asset IDs before calling asset-scoped tools.',
  inputSchema: z.object({
    ...credentialsField,
  }),
  execute: async () => {
    try {
      return await intxGet('/api/v1/assets');
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list assets');
    }
  },
});

export const coinbaseGetAssetDetails = tool({
  description:
    'Get status, collateral weight, and borrow limits for a single International Exchange asset by name, UUID, or ID.',
  inputSchema: z.object({
    ...credentialsField,
    asset: z.string().describe('Asset identifier: name (e.g. BTC, ETH, USDC), UUID, or asset ID'),
  }),
  execute: async ({ asset }) => {
    try {
      return await intxGet(`/api/v1/assets/${encodeURIComponent(asset)}`);
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get asset details');
    }
  },
});

export const coinbaseGetSupportedNetworks = tool({
  description:
    'List blockchain networks supporting an International Exchange asset for deposits and withdrawals, with confirmation counts and withdrawal limits.',
  inputSchema: z.object({
    ...credentialsField,
    asset: z.string().describe('Asset identifier: name (e.g. BTC, ETH, USDC), UUID, or asset ID'),
  }),
  execute: async ({ asset }) => {
    try {
      return await intxGet(`/api/v1/assets/${encodeURIComponent(asset)}/networks`);
    } catch (error) {
      return toCoinbaseError(error, 'Failed to get supported networks');
    }
  },
});
