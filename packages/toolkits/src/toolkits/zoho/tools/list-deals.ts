// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoListDeals = tool({
    description: 'Retrieves a list of deals from Zoho CRM with support for filtering, sorting, and pagination. Use this action when you need to fetch deal records from Zoho CRM, whether all deals or filtered by specific criteria. The action supports both discrete pagination (page/per_page) for the first 2,000 deals a',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        ids: z.string().optional().describe('Comma-separated deal IDs to fetch specific deals. Note: This parameter is ignored when page_token is provided.'),
        cvid: z.number().int().optional().describe('Custom view ID to filter the deals. Cannot be used together with sort_by. Note: This parameter is ignored when page_token is provided.'),
        page: z.number().int().min(1).optional().describe('Page number to retrieve. Without page_token, only the first 2,000 deals are accessible using page/per_page. Maximum page number is floor(2000/per_page). Do not use together with page_token.'),
        fields: z.string().min(1).optional().describe('Comma-separated API names of the deal fields to retrieve (max 50). At least one field must be specified (empty string not allowed). Common deal fields: Deal_Name, Amount, Stage, Closing_Date, Account_'),
        sort_by: z.string().optional().describe('Valid fields for sorting Zoho CRM deals.'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of deals per page (default 25, max is 200). Applies to both page and page_token pagination.'),
        converted: z.string().optional().describe('Filter by conversion status: \'true\', \'false\', or \'both\'.'),
        page_token: z.string().optional().describe('Token-based pagination parameter to fetch deals beyond the 2,000-record discrete limit. Use the info.next_page_token from the previous response. Cannot be used together with page.'),
        sort_order: z.string().optional().describe('Sort order for deals.'),
        territory_id: z.string().optional().describe('Territory identifier to filter deals by territory.'),
        include_child: z.boolean().optional().describe('Include child territory records (default: false). Only applicable when territory_id is provided.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/Deals`;
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
            return { error: 'Error in ZohoListDeals', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
