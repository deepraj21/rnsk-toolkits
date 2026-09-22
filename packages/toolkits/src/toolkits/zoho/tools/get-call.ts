// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetCall = tool({
    description: 'Retrieves a specific Call record by its unique identifier from Zoho CRM. Use this action when you need to fetch detailed information about a particular call, including its subject, duration, type, participants, outcome, and associated contacts or deals. This action is read-only and does not modify a',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        fields: z.string().optional().describe('Comma-separated API names of specific fields to retrieve (max 50). If not specified, all standard fields are returned. Common fields: Subject, Call_Type, Call_Start_Time, Call_Duration, Call_Purpose, '),
        record_id: z.string().describe('The unique identifier of the Call record to retrieve. Must be a valid Zoho CRM record ID.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Calls/${p.record_id}`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetCall', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
