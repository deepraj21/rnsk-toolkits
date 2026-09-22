// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wiseFetch } from './utils.js';

export const wiseCreateQuote = tool({
  description: 'Create a transient Wise bank-transfer quote for a personal or business profile. The quote expires; this tool does not create or fund a transfer and does not move money.',
  inputSchema: z.object({
    wiseApiKey: z.string().optional().describe('Wise API token (Bearer). Injected via manifest.'),
    profileId: z.number().describe('Wise profile ID from WISE_LIST_PROFILES; PERSONAL profiles are supported.'),
    sourceCurrency: z.string().length(3).describe('Three-letter ISO currency code being sent, such as USD.'),
    targetCurrency: z.string().length(3).describe('Three-letter ISO currency code being received, such as EUR.'),
    sourceAmount: z.number().positive().optional().describe('Amount to send in sourceCurrency. Provide exactly one of sourceAmount or targetAmount.'),
    targetAmount: z.number().positive().optional().describe('Amount the recipient should receive in targetCurrency. Provide exactly one of sourceAmount or targetAmount.'),
    preferredPayIn: z.string().optional().describe('Pay-in method for this toolkit; BANK_TRANSFER is the live-verified option.'),
  }),
  execute: async ({ wiseApiKey, profileId, sourceCurrency, targetCurrency, sourceAmount, targetAmount, preferredPayIn }) => {
    if (!wiseApiKey) return { error: 'Wise API key is required. Connect Wise first.' };
    if (!sourceAmount && !targetAmount) return { error: 'Provide exactly one of sourceAmount or targetAmount.' };
    if (sourceAmount && targetAmount) return { error: 'Provide only one of sourceAmount or targetAmount, not both.' };
    try {
      const body: Record<string, unknown> = {
        sourceCurrency,
        targetCurrency,
        preferredPayIn: preferredPayIn ?? 'BANK_TRANSFER',
      };
      if (sourceAmount !== undefined) body.sourceAmount = sourceAmount;
      if (targetAmount !== undefined) body.targetAmount = targetAmount;

      const res = await wiseFetch(`/v3/profiles/${profileId}/quotes`, {
        wiseApiKey,
        method: 'POST',
        body,
      });
      if (!res.ok) return { error: 'Failed to create quote', details: res.data };
      const d: any = res.data;
      return {
        quoteId: d.id ?? d.quoteId,
        profileId: d.profile ?? profileId,
        status: d.status,
        sourceCurrency: d.sourceCurrency,
        targetCurrency: d.targetCurrency,
        sourceAmount: d.sourceAmount,
        targetAmount: d.targetAmount,
        rate: d.rate,
        rateType: d.rateType,
        createdAt: d.createdTime ?? d.createdAt,
        rateExpiresAt: d.rateExpirationTime ?? d.rateExpiresAt,
        quoteExpiresAt: d.expirationTime ?? d.quoteExpiresAt ?? d.expiration,
        paymentOptions: d.paymentOptions,
        notices: d.notices,
        raw: d,
      };
    } catch (e) {
      return { error: 'Error creating quote', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
