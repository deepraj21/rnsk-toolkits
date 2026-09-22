// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetContact = tool({
    description: 'Retrieves a single contact record by ID from Zoho CRM. Returns the complete contact details including owner information, account associations, address fields, and all custom fields. Use this action when you need to fetch detailed information about a specific contact using its record ID.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        record_id: z.string().describe('The unique ID of the contact record to retrieve. Must be a valid Zoho CRM contact record ID.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Contacts/${p.record_id}`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetContact', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
