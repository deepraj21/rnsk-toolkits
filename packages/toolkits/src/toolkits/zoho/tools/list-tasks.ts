// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoListTasks = tool({
    description: 'Retrieves tasks from the Tasks module in Zoho CRM with support for filtering, pagination, and sorting. Use this action when you need to fetch a list of tasks, either all tasks or specific tasks by IDs. Supports both discrete pagination (up to 2,000 tasks) and token-based pagination for larger datase',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        ids: z.string().optional().describe('Comma-separated task IDs to fetch specific tasks. Note: This parameter is ignored when page_token is provided.'),
        cvid: z.number().int().optional().describe('Custom view ID to filter the tasks. Cannot be used together with sort_by. Note: This parameter is ignored when page_token is provided.'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve. Without page_token, only the first 2,000 tasks are accessible using page/per_page. Maximum page number is floor(2000/per_page). Do not use together with page_token.'),
        fields: z.string().min(1).optional().describe('Comma-separated API names of the fields to retrieve (max 50). At least one field must be specified (empty string not allowed). Common fields: Subject, Status, Priority, Due_Date, Owner, Description, C'),
        sort_by: z.string().optional().describe('Valid fields for sorting Zoho CRM tasks.'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of tasks per page (default 25, max 200). Applies to both page and page_token pagination.'),
        page_token: z.string().optional().describe('Token-based pagination parameter to fetch tasks beyond the 2,000-record discrete limit. Use the info.next_page_token from the previous response. Cannot be used together with page.'),
        sort_order: z.string().optional().describe('Sort order for tasks.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Tasks`;
            const query: any = {};
            if (p.fields) query.fields = p.fields;
            if (p.page) query.page = p.page;
            if (p.per_page) query.per_page = p.per_page;
            if (p.per_page) query.per_page = p.per_page;
            if (p.sort_by) query.sort_by = p.sort_by;
            if (p.sort_order) query.sort_order = p.sort_order;
            if (p.cvid) query.cvid = p.cvid;
            if (p.page_token) query.page_token = p.page_token;
            if (p.approved) query.approved = p.approved;
            if (p.territoryId) query.territory_id = p.territoryId;
            if (p.includeChild !== undefined) query.include_child = p.includeChild;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query });
            if (!res.ok) return { error: 'Failed to list', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoListTasks', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
