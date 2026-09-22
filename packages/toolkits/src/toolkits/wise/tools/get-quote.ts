// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseGetQuote = tool({
  description: 'Retrieve a Wise quote by profile and quote ID, including its current status, pricing, payment options, and expiration.',
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token.'),
    profileId: z.number().describe('Wise profile ID that owns the quote.'),
    quoteId: z.string().uuid().describe('Quote UUID returned by WISE_CREATE_QUOTE.'),
  }),
  execute: async ({ wiseApiKey, profileId, quoteId }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    try {
      const res = await wiseFetch(`/v3/profiles/${profileId}/quotes/${quoteId}`, {
        wiseApiKey,
        method: 'GET',
      });
      if (!res.ok) return { error: 'Failed to get quote', details: res.data };
      const d: any = res.data;
      return {
        quoteId: d.id ?? d.quoteId ?? quoteId,
        profileId: d.profile ?? profileId,
        status: d.status,
        sourceCurrency: d.sourceCurrency,
        targetCurrency: d.targetCurrency,
        sourceAmount: d.sourceAmount,
        targetAmount: d.targetAmount,
        rate: d.rate,
        rateType: d.rateType,
        createdAt: d.createdTime ?? d.createdAt,
        rateExpiresAt: d.rateExpirationTime,
        quoteExpiresAt: d.expirationTime ?? d.quoteExpiresAt,
        paymentOptions: d.paymentOptions,
        notices: d.notices,
        raw: d,
      };
    } catch (e) {
      return { error: 'Error getting quote', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
