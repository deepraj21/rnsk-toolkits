// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetEmailDrafts = tool({
    description: 'Retrieves email drafts associated with a specific record in Zoho CRM. Use this action when you need to view unsent email drafts that have been composed for a CRM record. This returns draft metadata including recipients, subject, content, attachments, and scheduling details.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        module: z.string().describe('The API name of the CRM module containing the record. Examples: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Cases\', etc. Must be the exact module API name, not the UI display label.'),
        record: z.string().describe('Entity ID of the record for which to retrieve email drafts.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module}/${p.record}/__email_drafts`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetEmailDrafts', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
