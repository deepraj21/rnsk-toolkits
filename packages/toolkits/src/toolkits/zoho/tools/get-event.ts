// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetEvent = tool({
    description: 'Retrieves a specific event record from Zoho CRM by its unique identifier. Returns complete event details including all standard and custom fields. Use this action when you need to fetch detailed information about a specific event/meeting, including participants, location, timing, and related records',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        record_id: z.string().describe('The unique identifier of the event record to retrieve'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Events/${p.record_id}`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetEvent', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
