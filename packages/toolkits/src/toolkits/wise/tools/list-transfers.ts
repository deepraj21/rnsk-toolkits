// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseListTransfers = tool({
  description: 'List and filter existing Wise transfers for a profile, one page at a time; this tool cannot create, fund, or cancel transfers.',
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token.'),
    profileId: z.number().describe('Wise profile ID whose transfers to list.'),
    statuses: z.array(z.enum(['incoming_payment_waiting', 'incoming_payment_initiated', 'processing', 'funds_converted', 'outgoing_payment_sent', 'cancelled', 'funds_refunded', 'bounced_back', 'charged_back', 'unknown'])).optional().describe('Wise transfer statuses to include; values are sent as a comma-separated filter.'),
    sourceCurrency: z.string().optional().describe('Optional three-letter source currency filter.'),
    targetCurrency: z.string().optional().describe('Optional three-letter target currency filter.'),
    createdAtOrAfter: z.string().optional().describe('Inclusive ISO 8601 lower bound for transfer creation time.'),
    createdAtOrBefore: z.string().optional().describe('Inclusive ISO 8601 upper bound for transfer creation time.'),
    pageSize: z.number().min(1).max(99).optional().describe('Transfers to return in this page (1-99).'),
    nextCursor: z.string().optional().describe('Opaque continuation cursor returned by a previous call; omit for the first page.'),
  }),
  execute: async ({ wiseApiKey, profileId, statuses, sourceCurrency, targetCurrency, createdAtOrAfter, createdAtOrBefore, pageSize, nextCursor }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    try {
      const res = await wiseFetch('/v1/transfers', {
        wiseApiKey,
        method: 'GET',
        query: {
          profile: profileId,
          status: statuses ? statuses.join(',') : undefined,
          sourceCurrency,
          targetCurrency,
          createdAtOrAfter,
          createdAtOrBefore,
          limit: pageSize,
          cursor: nextCursor,
        },
      });
      if (!res.ok) return { error: 'Failed to list transfers', details: res.data };
      const d: any = res.data;
      const transfers = d.content ?? d.transfers ?? [];
      return {
        transfers,
        hasMore: d.hasMore ?? !!d.nextCursor,
        nextCursor: d.nextCursor ?? null,
        raw: d,
      };
    } catch (e) {
      return { error: 'Error listing transfers', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
