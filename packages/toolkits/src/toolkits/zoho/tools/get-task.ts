// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetTask = tool({
    description: 'Retrieves a specific task record by its ID from Zoho CRM. Returns complete task data including all standard and custom fields, subforms, and multi-user lookup fields that are only available when fetching individual records. Use this action when you need to fetch detailed information about a single t',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        fields: z.string().optional().describe('Comma-separated API names of the fields to retrieve (max 50). If not specified, all standard fields are returned. Common task fields: Subject, Description, Due_Date, Status, Priority, Owner, Who_Id, W'),
        record_id: z.string().describe('The unique identifier of the task to retrieve.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Tasks/${p.record_id}`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.module_api_name) query.module = p.module_api_name;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to get', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetTask', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
