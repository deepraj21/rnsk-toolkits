// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseListRecipients = tool({
  description: 'List Wise recipients for a profile, optionally filtering by active status, ownership, currency, or account type. Returns summary identity fields but excludes bank-account details; this tool cannot modify recipients.',
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token.'),
    profileId: z.number().describe('Wise profile ID whose recipients to list.'),
    active: z.boolean().optional().describe('Whether to return active recipients; defaults to true.'),
    currencies: z.array(z.string()).optional().describe('Optional recipient currency codes to include.'),
    recipientTypes: z.array(z.string()).optional().describe('Optional Wise recipient account types to include, such as iban or swift_code.'),
    ownedByCustomer: z.boolean().optional().describe('Optionally filter recipients by whether the connected customer owns the destination account.'),
    pageSize: z.number().min(1).max(20).optional().describe('Recipients to return in this page (1-20).'),
    nextCursor: z.string().optional().describe('Opaque continuation cursor returned by a previous call; omit for the first page.'),
  }),
  execute: async ({ wiseApiKey, profileId, active, currencies, recipientTypes, ownedByCustomer, pageSize, nextCursor }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    try {
      const res = await wiseFetch('/v1/accounts', {
        wiseApiKey,
        method: 'GET',
        query: {
          profile: profileId,
          currency: currencies ? currencies.join(',') : undefined,
          type: recipientTypes ? recipientTypes.join(',') : undefined,
          ownedByCustomer,
          size: pageSize,
          cursor: nextCursor,
        },
      });
      if (!res.ok) return { error: 'Failed to list recipients', details: res.data };
      const d: any = res.data;
      // Wise accounts endpoint paginates with nextCursor
      // For active filter, do client-side filtering if needed
      let recipients = d.content ?? d.recipients ?? d.accounts ?? [];
      if (active !== undefined) {
        recipients = recipients.filter((r: any) => r.active === active);
      }
      return {
        recipients,
        hasMore: d.hasMore ?? !!d.nextCursor,
        nextCursor: d.nextCursor ?? null,
        raw: d,
      };
    } catch (e) {
      return { error: 'Error listing recipients', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
