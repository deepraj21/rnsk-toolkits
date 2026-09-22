// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseGetExchangeRate = tool({
  description: "Get Wise's latest exchange rate for one source and target currency pair; this is an indicative rate, not a transfer quote.",
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token (Bearer).'),
    sourceCurrency: z.string().length(3).describe('Three-letter ISO currency code to convert from, such as USD.'),
    targetCurrency: z.string().length(3).describe('Three-letter ISO currency code to convert to, such as EUR.'),
  }),
  execute: async ({ wiseApiKey, sourceCurrency, targetCurrency }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    try {
      const res = await wiseFetch('/v1/rates', {
        wiseApiKey,
        method: 'GET',
        query: {
          source: sourceCurrency,
          target: targetCurrency,
        },
      });
      if (!res.ok) return { error: 'Failed to get exchange rate', details: res.data };
      const data: any = res.data;
      // Wise returns array like [{ source, target, rate, time }] or single object
      const rateObj = Array.isArray(data) ? data[0] : data;
      if (!rateObj) return { error: 'No rate returned', details: data };
      return {
        rate: rateObj.rate,
        sourceCurrency: rateObj.source ?? sourceCurrency,
        targetCurrency: rateObj.target ?? targetCurrency,
        observedAt: rateObj.time ?? rateObj.observedAt ?? new Date().toISOString(),
        raw: data,
      };
    } catch (e) {
      return { error: 'Error getting exchange rate', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
