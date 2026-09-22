// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseListBalances = tool({
  description: 'List standard balances and savings jars for a Wise profile without creating, deleting, or moving funds between balances.',
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token.'),
    profileId: z.number().describe('Wise profile ID whose balances to list.'),
    balanceTypes: z.array(z.enum(['STANDARD', 'SAVINGS'])).optional().describe('Balance types to include; defaults to both STANDARD balances and SAVINGS jars.'),
  }),
  execute: async ({ wiseApiKey, profileId, balanceTypes }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    try {
      const res = await wiseFetch(`/v4/profiles/${profileId}/balances`, {
        wiseApiKey,
        method: 'GET',
        query: {
          types: balanceTypes ? balanceTypes.join(',') : undefined,
        },
      });
      if (!res.ok) return { error: 'Failed to list balances', details: res.data };
      const d: any = res.data;
      const balances = Array.isArray(d) ? d : d.balances ?? [];
      return { balances, raw: d };
    } catch (e) {
      return { error: 'Error listing balances', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
