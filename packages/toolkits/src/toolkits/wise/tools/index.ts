// @ts-nocheck
import { wiseCreateQuote } from './create-quote.js';
import { wiseGetExchangeRate } from './get-exchange-rate.js';
import { wiseGetQuote } from './get-quote.js';
import { wiseListActivities } from './list-activities.js';
import { wiseListBalances } from './list-balances.js';
import { wiseListCurrencies } from './list-currencies.js';
import { wiseListProfiles } from './list-profiles.js';
import { wiseListRecipients } from './list-recipients.js';
import { wiseListTransfers } from './list-transfers.js';

export {
  wiseCreateQuote,
  wiseGetExchangeRate,
  wiseGetQuote,
  wiseListActivities,
  wiseListBalances,
  wiseListCurrencies,
  wiseListProfiles,
  wiseListRecipients,
  wiseListTransfers,
};

export const wiseTools = [
  {
    name: 'wiseCreateQuote',
    description: 'Create a transient Wise bank-transfer quote for a personal or business profile. The quote expires; this tool does not create or fund a transfer and does not move money.',
    tool: wiseCreateQuote,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'write' as const,
  },
  {
    name: 'wiseGetExchangeRate',
    description: "Get Wise's latest exchange rate for one source and target currency pair; this is an indicative rate, not a transfer quote.",
    tool: wiseGetExchangeRate,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'read' as const,
  },
  {
    name: 'wiseGetQuote',
    description: 'Retrieve a Wise quote by profile and quote ID, including its current status, pricing, payment options, and expiration.',
    tool: wiseGetQuote,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'read' as const,
  },
  {
    name: 'wiseListActivities',
    description: "List a Wise profile's account activity with optional status, resource-type, and time filters, one page at a time.",
    tool: wiseListActivities,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'read' as const,
  },
  {
    name: 'wiseListBalances',
    description: 'List standard balances and savings jars for a Wise profile without creating, deleting, or moving funds between balances.',
    tool: wiseListBalances,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'read' as const,
  },
  {
    name: 'wiseListCurrencies',
    description: 'List currencies Wise currently supports for transfers, including their ISO codes and decimal support.',
    tool: wiseListCurrencies,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'read' as const,
  },
  {
    name: 'wiseListProfiles',
    description: "List the connected Wise account's personal or business profiles and return the profile IDs required by profile-scoped tools.",
    tool: wiseListProfiles,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'read' as const,
  },
  {
    name: 'wiseListRecipients',
    description: 'List Wise recipients for a profile, optionally filtering by active status, ownership, currency, or account type.',
    tool: wiseListRecipients,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'read' as const,
  },
  {
    name: 'wiseListTransfers',
    description: 'List and filter existing Wise transfers for a profile, one page at a time; this tool cannot create, fund, or cancel transfers.',
    tool: wiseListTransfers,
    requiredAuth: 'wiseApiKey' as const,
    scope: 'read' as const,
  },
];
