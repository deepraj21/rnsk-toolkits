// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetAccount = tool({
    description: 'Retrieves a specific Account record from Zoho CRM by its unique identifier. Returns complete account details including all standard and custom fields. Use this action when you need to fetch a single account\'s information by its ID rather than searching or listing multiple accounts. Unlike bulk reco',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        fields: z.string().optional().describe('Comma-separated API names of fields to retrieve (max 50 fields). If not specified, all available fields for the account are returned. Common fields: Account_Name, Website, Phone, Email, Industry, Annu'),
        account_id: z.string().describe('The unique identifier of the Account record to retrieve.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Accounts/${p.account_id}`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetAccount', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
