// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseListActivities = tool({
  description: "List a Wise profile's account activity with optional status, resource-type, and time filters, one page at a time.",
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token.'),
    profileId: z.number().describe('Wise profile ID whose activity to list.'),
    status: z.enum(['REQUIRES_ATTENTION', 'IN_PROGRESS', 'UPCOMING', 'COMPLETED', 'CANCELLED']).optional().describe('Optional activity status to include.'),
    resourceType: z.enum(['ACCRUAL_CHARGE', 'ACQUIRING_PAYMENT', 'ASSETS_WITHDRAWAL', 'BALANCE_CASHBACK', 'BALANCE_INTEREST', 'BALANCE_TRANSACTION', 'BANK_DETAILS_ORDER', 'BATCH_TRANSFER', 'CARD_CASHBACK', 'CARD_ORDER', 'CARD_TRANSACTION', 'DIRECT_DEBIT_INSTRUCTION', 'DIRECT_DEBIT_TRANSACTION', 'FEE_REFUND', 'INCIDENT_REFUND', 'INCORPORATION_ORDER', 'OPERATIONAL_TRANSACTION', 'PAYMENT_REQUEST', 'REWARD', 'REWARDS_REDEMPTION', 'SEND_ORDER', 'SEND_ORDER_EXECUTION', 'TRANSFER']).optional().describe('Optional Wise monetary resource type to include.'),
    since: z.string().optional().describe('Return activity at or after this ISO 8601 timestamp.'),
    until: z.string().optional().describe('Return activity at or before this ISO 8601 timestamp.'),
    pageSize: z.number().min(1).max(100).optional().describe('Activities to return in this page (1-100).'),
    nextCursor: z.string().optional().describe('Continuation cursor returned by a previous call; omit for the first page.'),
  }),
  execute: async ({ wiseApiKey, profileId, status, resourceType, since, until, pageSize, nextCursor }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    try {
      const res = await wiseFetch(`/v3/profiles/${profileId}/activities`, {
        wiseApiKey,
        method: 'GET',
        query: {
          status,
          resourceType,
          since,
          until,
          size: pageSize,
          cursor: nextCursor,
        },
      });
      if (!res.ok) return { error: 'Failed to list activities', details: res.data };
      const d: any = res.data;
      // Wise activities endpoint returns { activities: [...], nextCursor }
      return {
        activities: d.activities ?? d.data ?? [],
        hasMore: d.hasMore ?? !!d.nextCursor,
        nextCursor: d.nextCursor ?? d.next_cursor ?? null,
        raw: d,
      };
    } catch (e) {
      return { error: 'Error listing activities', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
