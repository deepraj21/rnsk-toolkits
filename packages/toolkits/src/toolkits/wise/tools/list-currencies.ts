// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseListCurrencies = tool({
  description: 'List currencies Wise currently supports for transfers, including their ISO codes and decimal support.',
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token.'),
    locale: z.string().optional().describe('Language code for localized currency names, such as en, de, fr, or ja.'),
  }),
  execute: async ({ wiseApiKey, locale }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    try {
      const res = await wiseFetch('/v1/currencies', {
        wiseApiKey,
        method: 'GET',
        query: { locale },
      });
      if (!res.ok) return { error: 'Failed to list currencies', details: res.data };
      const d: any = res.data;
      const currencies = Array.isArray(d) ? d : d.currencies ?? [];
      return { currencies, raw: d };
    } catch (e) {
      return { error: 'Error listing currencies', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
