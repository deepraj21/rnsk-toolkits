// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paginationFields, razorpayCredentialsField, razorpayRequest } from './client.js';

const contactType = z.enum(['employee', 'vendor', 'customer']);

export const createContact = tool({
    description: 'Adds a RazorpayX payout contact (employee, vendor, or customer). Returns cont_... ID for payouts.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        name: z.string().describe("Contact name, e.g. 'Gaurav Kumar'"),
        type: contactType,
        email: z.string().optional(),
        contact: z.string().optional().describe('Phone number'),
        referenceId: z.string().optional().describe('Your-system reference ID'),
        notes: z.record(z.string()).optional(),
    }),
    execute: async ({ razorpayCredentials, referenceId, ...body }) =>
        razorpayRequest(razorpayCredentials, '/contacts', { method: 'POST', body: { reference_id: referenceId, ...body } }, 'create contact'),
});

export const getContact = tool({
    description: 'Reads one payout contact (details, type, metadata).',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        contactId: z.string().regex(/^cont_[a-zA-Z0-9]+$/).describe("Contact ID, e.g. 'cont_SMoUIhAssfaDoy'"),
    }),
    execute: async ({ razorpayCredentials, contactId }) =>
        razorpayRequest(razorpayCredentials, `/contacts/${contactId}`, undefined, 'get contact'),
});

export const updateContact = tool({
    description: 'Updates contact name/email/phone/type/reference/notes. Only provided fields change.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        contactId: z.string().describe('Contact ID to update'),
        name: z.string().optional(),
        type: contactType.optional(),
        email: z.string().optional(),
        contact: z.string().optional().describe('Phone number'),
        referenceId: z.string().optional(),
        notes: z.record(z.string()).optional(),
    }),
    execute: async ({ razorpayCredentials, contactId, referenceId, ...body }) =>
        razorpayRequest(razorpayCredentials, `/contacts/${contactId}`, { method: 'PATCH', body: { reference_id: referenceId, ...body } }, 'update contact'),
});

export const getFundAccount = tool({
    description: 'Reads one payout destination (bank_account/vpa/card details + linked contact).',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        fundAccountId: z.string().regex(/^fa_[a-zA-Z0-9]+$/).describe("Fund account ID, e.g. 'fa_SMoVEssDpymuR8'"),
    }),
    execute: async ({ razorpayCredentials, fundAccountId }) =>
        razorpayRequest(razorpayCredentials, `/fund_accounts/${fundAccountId}`, undefined, 'get fund account'),
});

export const listFundAccounts = tool({
    description: 'Lists payout destinations with contact/type filters and pagination.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        contactId: z.string().optional().describe('Filter by contact (cont_...)'),
        accountType: z.string().optional().describe("Filter: 'bank_account', 'vpa', 'card', 'wallet'"),
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, contactId, accountType, ...query }) =>
        razorpayRequest(razorpayCredentials, '/fund_accounts', { query: { contact_id: contactId, account_type: accountType, ...query } }, 'list fund accounts'),
});

export const listFundValidations = tool({
    description: 'Lists bank-account validation transactions (status, registered name) with date filters and pagination.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        from: z.number().int().optional().describe('Validations created on/after this Unix time'),
        to: z.number().int().optional().describe('Validations created on/before this Unix time'),
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, ...query }) =>
        razorpayRequest(razorpayCredentials, '/fund_accounts/validations', { query }, 'list fund validations'),
});

export const getTransferReversals = tool({
    description: 'Lists Route transfer reversals (status, history) with date filters and pagination.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        transferId: z.string().describe("Transfer ID, e.g. 'trf_Lt048W7cgLdo1u'"),
        fromTimestamp: z.number().int().optional().describe('Reversals created on/after this Unix time'),
        toTimestamp: z.number().int().optional().describe('Reversals created on/before this Unix time'),
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, transferId, fromTimestamp, toTimestamp, ...rest }) =>
        razorpayRequest(razorpayCredentials, `/transfers/${transferId}/reversals`, { query: { from: fromTimestamp, to: toTimestamp, ...rest } }, 'get transfer reversals'),
});

export const getSettlementRecon = tool({
    description: 'Fetches the settlement reconciliation report (transactions, fees, UTRs) for a day or whole month. Use for accounting.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        year: z.number().int().min(2000).max(3000).describe("Year, e.g. 2024"),
        month: z.number().int().min(1).max(12),
        day: z.number().int().min(1).max(31).optional().describe('Day 1-31 (omit for the whole month)'),
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, ...query }) =>
        razorpayRequest(razorpayCredentials, '/settlements/recon/combined', { query }, 'get settlement recon'),
});
