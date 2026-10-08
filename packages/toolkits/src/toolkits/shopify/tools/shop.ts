// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { shopifyRequest, failedResult, toShopifyError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const shopifyGetShop = tool({
  description:
    'Get store profile and settings (GET /shop.json). Use to confirm connection, currency, domain, and plan.',
  inputSchema: z.object({
    shopifyCredentials: credField,
  }),
  execute: async ({ shopifyCredentials }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, '/shop.json');
      if (!result.ok) return failedResult('Failed to get shop', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error getting shop');
    }
  },
});
