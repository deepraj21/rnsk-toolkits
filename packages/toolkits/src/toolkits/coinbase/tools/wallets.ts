// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { missingCredentials, toCoinbaseError, v2SignedGet } from './client.js';

export const coinbaseListWallets = tool({
  description:
    'List Coinbase retail wallets (accounts) with balances and pagination. Requires API credentials with wallet read scope.',
  inputSchema: z.object({
    coinbaseCredentials: z
      .string()
      .optional()
      .describe(
        'Injected credentials JSON {apiKey, apiSecret} — required for this private endpoint',
      ),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Wallets per page (1-100, default 25)'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort order (default desc)'),
    startingAfter: z
      .string()
      .optional()
      .describe('Paginate forward: ID of the last wallet from the previous page'),
    endingBefore: z
      .string()
      .optional()
      .describe('Paginate backward: ID of the first wallet from the previous page'),
  }),
  execute: async ({ coinbaseCredentials, limit, order, startingAfter, endingBefore }) => {
    try {
      if (!coinbaseCredentials) return missingCredentials();
      return await v2SignedGet(coinbaseCredentials, '/accounts', {
        limit,
        order,
        starting_after: startingAfter,
        ending_before: endingBefore,
      });
    } catch (error) {
      return toCoinbaseError(error, 'Failed to list wallets');
    }
  },
});
